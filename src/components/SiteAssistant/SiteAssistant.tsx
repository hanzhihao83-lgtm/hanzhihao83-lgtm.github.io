import { createAssistantKnowledge } from "./assistantKnowledge";
import { SiteAssistantClient } from "./SiteAssistantClient";

export function SiteAssistant() {
  return <SiteAssistantClient knowledge={createAssistantKnowledge()} />;
}
