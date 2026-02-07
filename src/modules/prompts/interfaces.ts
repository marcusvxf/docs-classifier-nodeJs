export interface Prompt {
  id?: number;
  title: string;
  content: string;
  created_at?: string;
}

// shape used when creating a new prompt
export type CreatePrompt = Pick<Prompt, 'title' | 'content'>;

// shape used when patching/updating a prompt
export type UpdatePrompt = Partial<CreatePrompt>;

export default Prompt;
