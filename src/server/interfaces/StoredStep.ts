import { ActionDefinition } from "./ActionDefinition";
import RespostaValida from "./RespostaValida";

export interface StoredStep {
    stepId: string;
    actions: ActionDefinition[];
}
