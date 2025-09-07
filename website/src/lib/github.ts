export interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  assets: GitHubAsset[];
}

export interface GitHubAsset {
  name: string;
  size: number;
  download_count: number;
  browser_download_url: string;
  content_type: string;
}

export interface PlatformInfo {
  name: string;
  version: string;
  size: string;
  downloadUrl: string;
  checksumUrl: string;
  downloadCount: number;
}

const GITHUB_API_BASE = 'https://api.github.com/repos/tarunjawla/passman';

export async function getLatestRelease(): Promise<GitHubRelease | null> {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/releases/latest`);
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch latest release:', error);
    return null;
  }
}

export function formatFileSize(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

export function getPlatformInfo(asset: GitHubAsset, platform: string): PlatformInfo {
  const version = asset.name.match(/v?(\d+\.\d+\.\d+)/)?.[1] || '1.0.0';
  
  return {
    name: platform,
    version: `v${version}`,
    size: formatFileSize(asset.size),
    downloadUrl: asset.browser_download_url,
    checksumUrl: asset.browser_download_url + '.sha256',
    downloadCount: asset.download_count
  };
}

export function getAssetForPlatform(assets: GitHubAsset[], platform: string): GitHubAsset | null {
  const patterns = {
    linux: [/linux/i, /\.tar\.gz$/],
    macos: [/macos/i, /\.dmg$/],
    windows: [/windows/i, /\.exe$|\.msi$/],
    cli: [/cli/i, /\.tar\.gz$|\.zip$/]
  };

  const platformPatterns = patterns[platform as keyof typeof patterns];
  if (!platformPatterns) return null;

  return assets.find(asset => 
    platformPatterns.every(pattern => pattern.test(asset.name))
  ) || null;
}

export async function getPlatformDownloadInfo(platform: string): Promise<PlatformInfo | null> {
  const release = await getLatestRelease();
  if (!release) return null;

  const asset = getAssetForPlatform(release.assets, platform);
  if (!asset) return null;

  return getPlatformInfo(asset, platform);
}

export async function getAllPlatformInfo(): Promise<Record<string, PlatformInfo | null>> {
  const release = await getLatestRelease();
  if (!release) {
    return {
      linux: null,
      macos: null,
      windows: null,
      cli: null
    };
  }

  const platforms = ['linux', 'macos', 'windows', 'cli'];
  const result: Record<string, PlatformInfo | null> = {};

  for (const platform of platforms) {
    const asset = getAssetForPlatform(release.assets, platform);
    result[platform] = asset ? getPlatformInfo(asset, platform) : null;
  }

  return result;
}
