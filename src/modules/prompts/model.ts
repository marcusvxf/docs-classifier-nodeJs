import { Pool } from 'pg';
import { Prompt, CreatePrompt, UpdatePrompt } from './interfaces';

export default class PromptModel {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async create(prompt: CreatePrompt): Promise<Prompt> {
    const res = await this.pool.query(
      'INSERT INTO prompts (title, content) VALUES ($1, $2) RETURNING id, title, content, created_at',
      [prompt.title, prompt.content]
    );
    return res.rows[0];
  }

  async findAll(): Promise<Prompt[]> {
    const res = await this.pool.query(
      'SELECT id, title, content, created_at FROM prompts ORDER BY id'
    );
    return res.rows;
  }

  async findById(id: number): Promise<Prompt | null> {
    const res = await this.pool.query(
      'SELECT id, title, content, created_at FROM prompts WHERE id = $1',
      [id]
    );
    return res.rows[0] ?? null;
  }

  async update(id: number, patch: UpdatePrompt): Promise<Prompt | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    const title = patch.title ?? existing.title;
    const content = patch.content ?? existing.content;
    const res = await this.pool.query(
      'UPDATE prompts SET title = $1, content = $2 WHERE id = $3 RETURNING id, title, content, created_at',
      [title, content, id]
    );
    return res.rows[0];
  }

  async delete(id: number): Promise<boolean> {
    const res = await this.pool.query('DELETE FROM prompts WHERE id = $1', [
      id,
    ]);
    return res.rowCount ? res.rowCount > 0 : false;
  }
}
