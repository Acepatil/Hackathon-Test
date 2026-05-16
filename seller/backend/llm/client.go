package llm

import (
	"log"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"regexp"
)

type ClaudeMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ClaudeRequest struct {
	Model     string          `json:"model"`
	MaxTokens int             `json:"max_tokens"`
	System    string          `json:"system,omitempty"`
	Messages  []ClaudeMessage `json:"messages"`
}

type OpenAIRequest struct {
	Model     string          `json:"model"`
	MaxTokens int             `json:"max_tokens"`
	Messages  []ClaudeMessage `json:"messages"`
}

type ClaudeResponse struct {
	Content []struct {
		Text string `json:"text"`
	} `json:"content"`
}

type OpenRouterResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

func CallClaude(system, user string) (string, error) {
    apiKey := os.Getenv("ANTHROPIC_API_KEY")
	fmt.Println(apiKey)
    if apiKey == "" {
        return "", fmt.Errorf("ANTHROPIC_API_KEY environment variable is not set")
    }

    model := "claude-sonnet-4 "
    if envModel := os.Getenv("LLM_MODEL"); envModel != "" {
        model = envModel
    }

    apiURL := "https://api.anthropic.com/v1/messages"
    useOpenRouter := false
    if envURL := os.Getenv("LLM_BASE_URL"); envURL != "" {
        apiURL = envURL
        useOpenRouter = true
    }

    var jsonData []byte
    var err error

    if useOpenRouter {
        // OpenRouter/OpenAI format: system prompt as a message
        reqBody := OpenAIRequest{
            Model:     model,
            MaxTokens: 1024,
            Messages: []ClaudeMessage{
                {Role: "system", Content: system},
                {Role: "user", Content: user},
            },
        }
        jsonData, err = json.Marshal(reqBody)
    } else {
        // Anthropic format: system as top-level field
        reqBody := ClaudeRequest{
            Model:     model,
            MaxTokens: 1024,
            System:    system,
            Messages: []ClaudeMessage{
                {Role: "user", Content: user},
            },
        }
        jsonData, err = json.Marshal(reqBody)
    }
    if err != nil {
        return "", err
    }

    req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonData))
    if err != nil {
        return "", err
    }

    req.Header.Set("Content-Type", "application/json")
    // Support both Anthropic and OpenRouter
    req.Header.Set("x-api-key", apiKey)
    req.Header.Set("Authorization", "Bearer "+apiKey)
    req.Header.Set("anthropic-version", "2023-06-01")

    client := &http.Client{}
	log.Printf("[CallClaude] POST %s model=%s body=%s", apiURL, model, string(jsonData))
    resp, err := client.Do(req)
    if err != nil {
        return "", err
    }
    defer resp.Body.Close()

    body, err := io.ReadAll(resp.Body)

    if err != nil {
        return "", err
    }
	log.Printf("[CallClaude] status=%d body=%s", resp.StatusCode, string(body))


    if resp.StatusCode != http.StatusOK {
        return "", fmt.Errorf("Claude API error: %d - %s", resp.StatusCode, string(body))
    }

    // Try OpenRouter/OpenAI format first (if using OpenRouter)
    var openRouterResp OpenRouterResponse
    if err := json.Unmarshal(body, &openRouterResp); err == nil && len(openRouterResp.Choices) > 0 {
        return openRouterResp.Choices[0].Message.Content, nil
    }

    // Fall back to Anthropic format
    var claudeResp ClaudeResponse
    if err := json.Unmarshal(body, &claudeResp); err != nil {
        return "", err
    }

    if len(claudeResp.Content) == 0 {
        return "", fmt.Errorf("empty response from Claude")
    }

    return claudeResp.Content[0].Text, nil
}

func ParseJsonLoose(text string, out interface{}) error {
	err := json.Unmarshal([]byte(text), out)
	if err == nil {
		return nil
	}

	re := regexp.MustCompile(`(?s)\{.*\}`)
	match := re.FindString(text)
	if match != "" {
		err = json.Unmarshal([]byte(match), out)
		if err == nil {
			return nil
		}
	}
	return fmt.Errorf("could not parse json from text: %v", err)
}

func ExtractSpecifications(name, description string) (map[string]string, error) {
	systemPrompt := `You are an AI assistant helping a seller extract product specifications from their product name and description. 
Extract key specifications (e.g., Pack Size, Purity, Material, Form, Color, Dimensions, etc.) if they are mentioned or implied.
Return ONLY a valid JSON object where keys are the specification names and values are the specification values.
Example: {"Pack Size": "5 Kg", "Purity": "99.9%"}
If no specifications can be found, return an empty JSON object: {}`

	userPrompt := fmt.Sprintf("Product Name: %s\nDescription: %s", name, description)

	respText, err := CallClaude(systemPrompt, userPrompt)
	if err != nil {
		return nil, err
	}

	var specs map[string]string
	err = ParseJsonLoose(respText, &specs)
	if err != nil {
		return nil, err
	}

	return specs, nil
}

type SuggestSpecsResponse struct {
	ConfigSpecs []string `json:"configSpecs"`
	OtherSpecs  []string `json:"otherSpecs"`
}

func SuggestSpecificationKeys(name, description string) (*SuggestSpecsResponse, error) {
	systemPrompt := `You are an AI assistant helping a seller determine which product specifications they should fill in based on their product name and description.
Suggest 3-5 relevant specification categories and categorize them explicitly into "configSpecs" (core configurations like Size, Weight, Material, Purity, Dimensions) and "otherSpecs" (secondary details like Packaging Type, Shelf Life, Certifications, Applications).
Return ONLY a valid JSON object with those two keys containing string arrays.
Example: {"configSpecs": ["Pack Size", "Purity", "Form"], "otherSpecs": ["Shelf Life", "Certifications"]}
If you cannot determine any, return: {"configSpecs": ["Specification 1"], "otherSpecs": ["Other Details"]}`

	userPrompt := fmt.Sprintf("Product Name: %s\nDescription: %s", name, description)

	respText, err := CallClaude(systemPrompt, userPrompt)
	if err != nil {
		return nil, err
	}

	var response SuggestSpecsResponse
	
	err = ParseJsonLoose(respText, &response)

	if err != nil || (len(response.ConfigSpecs) == 0 && len(response.OtherSpecs) == 0) {
		return &SuggestSpecsResponse{
			ConfigSpecs: []string{"Specification 1", "Specification 2"},
			OtherSpecs:  []string{"Other Details"},
		}, nil
	}

	return &response, nil
}
