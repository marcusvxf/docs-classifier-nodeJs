import { Pool } from 'pg';
import PromptModel from './model';
import { Prompt, CreatePrompt, UpdatePrompt } from './interfaces';

export default class PromptService {
  private model: PromptModel;

  constructor(pool: Pool) {
    this.model = new PromptModel(pool);
  }

  async create(prompt: CreatePrompt): Promise<Prompt> {
    return this.model.create(prompt);
  }

  async findAll(): Promise<Prompt[]> {
    return this.model.findAll();
  }

  async findById(id: number): Promise<Prompt | null> {
    return this.model.findById(id);
  }

  async update(id: number, patch: UpdatePrompt): Promise<Prompt | null> {
    return this.model.update(id, patch);
  }

  async delete(id: number): Promise<boolean> {
    return this.model.delete(id);
  }
}
