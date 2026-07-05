import { writeFileSync } from 'node:fs';
import path from 'node:path';
import type { ImportReport } from './types.js';

export function createEmptyReport(source: string): ImportReport {
  return {
    importedAt: new Date().toISOString(),
    source,
    products: {
      imported: [],
      updated: [],
      skipped: [],
      weakDescription: [],
      missingImage: [],
      missingLicenseAppCode: [],
      missingDownloadFiles: [],
      missingSeo: [],
      r2MappingNeeded: [],
    },
    blog: {
      imported: [],
      updated: [],
      under500Words: [],
      missingCover: [],
      missingSeoDescription: [],
      weakContent: [],
    },
    pages: {
      imported: [],
      updated: [],
      missingSeo: [],
      missingContent: [],
    },
    media: {
      blobLinked: [],
      r2Linked: [],
      localPathNeedsManualUpload: [],
    },
    redirects: {
      imported: [],
      updated: [],
    },
    preservedSlugs: {
      products: [],
      blog: [],
      pages: [],
    },
  };
}

export function writeReportFile(report: ImportReport, outputPath: string): void {
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

export function printReportSummary(report: ImportReport): void {
  console.log('\n=== Legacy Import Report ===');
  console.log(`Source: ${report.source}`);
  console.log(`Imported at: ${report.importedAt}`);
  console.log('\nProducts:');
  console.log(`  Created: ${report.products.imported.length}`);
  console.log(`  Updated: ${report.products.updated.length}`);
  console.log(`  Skipped: ${report.products.skipped.length}`);
  console.log(`  Weak description: ${report.products.weakDescription.length}`);
  console.log(`  Missing image: ${report.products.missingImage.length}`);
  console.log(`  Missing licenseAppCode: ${report.products.missingLicenseAppCode.length}`);
  console.log(`  Missing downloadFiles: ${report.products.missingDownloadFiles.length}`);
  console.log(`  Missing SEO: ${report.products.missingSeo.length}`);
  console.log(`  R2 mapping needed: ${report.products.r2MappingNeeded.length}`);
  console.log('\nBlog:');
  console.log(`  Created: ${report.blog.imported.length}`);
  console.log(`  Updated: ${report.blog.updated.length}`);
  console.log(`  Under 500 words: ${report.blog.under500Words.length}`);
  console.log(`  Missing cover: ${report.blog.missingCover.length}`);
  console.log(`  Missing SEO description: ${report.blog.missingSeoDescription.length}`);
  console.log(`  Weak content: ${report.blog.weakContent.length}`);
  console.log('\nPages:');
  console.log(`  Created: ${report.pages.imported.length}`);
  console.log(`  Updated: ${report.pages.updated.length}`);
  console.log(`  Missing SEO: ${report.pages.missingSeo.length}`);
  console.log(`  Missing content: ${report.pages.missingContent.length}`);
  console.log('\nMedia:');
  console.log(`  Blob linked: ${report.media.blobLinked.length}`);
  console.log(`  R2 linked: ${report.media.r2Linked.length}`);
  console.log(`  Local path (manual upload): ${report.media.localPathNeedsManualUpload.length}`);
  console.log('\nRedirects:');
  console.log(`  Created: ${report.redirects.imported.length}`);
  console.log(`  Updated: ${report.redirects.updated.length}`);
  console.log('\nPreserved slugs:');
  console.log(`  Products: ${report.preservedSlugs.products.join(', ') || '(none)'}`);
  console.log(`  Blog: ${report.preservedSlugs.blog.join(', ') || '(none)'}`);
  console.log(`  Pages: ${report.preservedSlugs.pages.join(', ') || '(none)'}`);
}

export function resolveReportOutputPath(): string {
  const custom = process.env.LEGACY_REPORT_PATH?.trim();
  if (custom) return path.resolve(custom);
  return path.resolve(process.cwd(), 'legacy-import-report.json');
}
