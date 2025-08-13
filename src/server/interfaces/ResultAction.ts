import { StoredStep } from "./StoredStep";

export interface ResultAction {
    success: boolean;
    nextStep?: StoredStep;
    error?: string;
}