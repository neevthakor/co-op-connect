const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(/catch\s*\(\s*err\s*:\s*any\s*\)/g, 'catch (err)');
  
  content = content.replace(
    /export function JobExecutionClient\(\{ initialJob \}: \{ initialJob: any \}\) \{/g,
    `export interface JobData {
  id: string;
  status: string;
  workerId?: string;
  customer: { user: { name: string; phone?: string; } };
  service: { title: string; category: { name: string } };
  jobProofs?: Array<{ id: string; type: string; url: string; }>;
  team?: { members?: Array<{ user: { name: string; }, role: string; }> };
  materialRequests?: Array<{ id: string; item: string; quantity: number; unitPrice: number; status: string; }>;
  [key: string]: unknown;
}

export function JobExecutionClient({ initialJob }: { initialJob: JobData }) {`
  );

  content = content.replace(/useState<any>\(initialJob\)/g, 'useState<JobData>(initialJob)');
  content = content.replace(/setJob\(\(prev: any\) =>/g, 'setJob((prev: JobData) =>');
  
  content = content.replace(/useState<any\[\]>\(\[\]\)/g, 'useState<Array<{ worker: { user: { name: string; }, primaryTrade: string; id: string; } }>>([])');
  content = content.replace(/let channelInstance: any = null/g, 'let channelInstance: unknown = null');

  content = content.replace(/\.filter\(\(p: any\)/g, '.filter((p: { type: string, url: string, id: string })');
  content = content.replace(/\.map\(\(member: any\)/g, '.map((member: { user: { name: string; }, role: string; id: string })');
  content = content.replace(/\.map\(\(mat: any\)/g, '.map((mat: { id: string; item: string; quantity: number; unitPrice: number; status: string; })');
  content = content.replace(/availableHelpers\.map\(\(match: any\)/g, 'availableHelpers.map((match: { worker: { user: { name: string; }, primaryTrade: string; id: string; } })');

  fs.writeFileSync(filePath, content, 'utf8');
}

fixFile('src/components/worker/job-execution-client.tsx');
