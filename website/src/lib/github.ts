export interface PlatformInfo {
  name: string;
  version: string;
  size: string;
  downloadUrl: string;
  checksumUrl: string;
  downloadCount: number;
}

export interface ReleaseInfo {
  tagName: string;
  name: string;
  publishedAt: string;
}

export interface ApiResponse {
  success: boolean;
  release: ReleaseInfo;
  platforms: PlatformInfo[];
  error?: string;
}

export async function getAllPlatformInfo(): Promise<Record<string, PlatformInfo | null>> {
  try {
    const response = await fetch('/api/github/releases');
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data: ApiResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch platform information');
    }
    
    // Convert array to object format expected by the frontend
    const result: Record<string, PlatformInfo | null> = {
      linux: null,
      macos: null,
      windows: null,
      cli: null
    };
    
    data.platforms.forEach(platform => {
      result[platform.name] = platform;
    });
    
    return result;
  } catch (error) {
    console.error('Failed to fetch platform information:', error);
    return {
      linux: null,
      macos: null,
      windows: null,
      cli: null
    };
  }
}

export async function getReleaseInfo(): Promise<ReleaseInfo | null> {
  try {
    const response = await fetch('/api/github/releases');
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data: ApiResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch release information');
    }
    
    return data.release;
  } catch (error) {
    console.error('Failed to fetch release information:', error);
    return null;
  }
}