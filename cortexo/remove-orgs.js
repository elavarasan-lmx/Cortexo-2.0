import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const files = [
  'projects.ts',
  'profiles.ts',
  'pipelines.ts',
  'notifications.ts',
  'errors.ts',
  'automation.ts',
].map(f => join(process.cwd(), 'packages/db/src/schema', f));

for (const file of files) {
  let content = readFileSync(file, 'utf-8');
  
  // Remove import
  content = content.replace(/import \{ organizations \} from '\.\/organizations';\n?/g, '');
  
  // Remove orgId field
  content = content.replace(/[ \t]*orgId: uuid\('org_id'\)\.references\(\(\) => organizations\.id\)(?: \.onDelete\('[^']+'\))?(?: \.onUpdate\('[^']+'\))?,?\n?/g, '');
  content = content.replace(/[ \t]*orgId: uuid\('org_id'\)\.references\(\(\) => organizations\.id(?:, \{ onDelete: '[^']+' \})?\),?\n?/g, '');
  content = content.replace(/[ \t]*orgId: uuid\('org_id'\),?\n?/g, ''); // just in case
  
  // Also remove index referring to orgId if it exists
  content = content.replace(/[ \t]*index\('[^']+'\)\.on\([^.]+\.orgId\),?\n?/g, '');
  
  writeFileSync(file, content);
  console.log(`Updated ${file}`);
}
