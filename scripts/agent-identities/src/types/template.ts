export interface TemplateSection {
  name: string;
  type: 'manual' | 'generated';
  startMarker?: string;
  endMarker?: string;
  content: string;
}

export interface TemplateMetadata {
  frontMatter: Record<string, any>;
  sections: TemplateSection[];
}


