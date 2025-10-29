export function codeBlock(content: string, language: string = ''): string {
  return `\`\`\`${language}\n${content}\n\`\`\``;
}

export function heading(text: string, level: number = 1): string {
  return `${'#'.repeat(level)} ${text}`;
}

export function list(items: string[], ordered: boolean = false): string {
  return items
    .map((item, index) =>
      ordered ? `${index + 1}. ${item}` : `- ${item}`
    )
    .join('\n');
}

export function table(headers: string[], rows: string[][]): string {
  const headerRow = `| ${headers.join(' | ')} |`;
  const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
  const dataRows = rows.map(row => `| ${row.join(' | ')} |`).join('\n');
  
  return `${headerRow}\n${separatorRow}\n${dataRows}`;
}

export function link(text: string, url: string): string {
  return `[${text}](${url})`;
}

export function bold(text: string): string {
  return `**${text}**`;
}

export function italic(text: string): string {
  return `*${text}*`;
}


