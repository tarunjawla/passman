import { NextRequest, NextResponse } from 'next/server'

const GITHUB_API_BASE = 'https://api.github.com/repos/tarunjawla/passman'

interface GitHubRelease {
  tag_name: string
  name: string
  published_at: string
  assets: Array<{
    name: string
    browser_download_url: string
    size: number
    download_count: number
  }>
}

interface PlatformInfo {
  name: string
  version: string
  size: string
  downloadUrl: string
  downloadCount: number
  checksumUrl: string
}

function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

function getPlatformInfo(asset: any, platform: string): PlatformInfo | null {
  const name = asset.name.toLowerCase()
  
  // Platform-specific patterns
  const patterns = {
    windows: ['windows', 'win', '.exe', '.msi'],
    macos: ['macos', 'mac', 'darwin', '.dmg'],
    linux: ['linux', '.tar.gz', '.deb', '.rpm'],
    cli: ['cli', 'passman-cli']
  }
  
  const platformPatterns = patterns[platform as keyof typeof patterns] || []
  const matches = platformPatterns.some(pattern => name.includes(pattern))
  
  if (!matches) return null
  
  return {
    name: platform,
    version: asset.name.match(/v?(\d+\.\d+\.\d+)/)?.[1] || '1.0.0',
    size: formatFileSize(asset.size),
    downloadUrl: asset.browser_download_url,
    downloadCount: asset.download_count,
    checksumUrl: asset.browser_download_url + '.sha256'
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get GitHub token from environment variable
    const token = process.env.GITHUB_TOKEN
    
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    // Fetch latest release
    const response = await fetch(`${GITHUB_API_BASE}/releases/latest`, {
      headers,
      next: { revalidate: 300 } // Cache for 5 minutes
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'No releases found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: `GitHub API error: ${response.status}` },
        { status: response.status }
      )
    }
    
    const release: GitHubRelease = await response.json()
    
    // Extract platform information
    const platforms: PlatformInfo[] = []
    const platformOrder = ['windows', 'macos', 'linux', 'cli']
    
    for (const platform of platformOrder) {
      const platformInfo = release.assets
        .map(asset => getPlatformInfo(asset, platform))
        .find(info => info !== null)
      
      if (platformInfo) {
        platforms.push(platformInfo)
      }
    }
    
    return NextResponse.json({
      success: true,
      release: {
        tagName: release.tag_name,
        name: release.name,
        publishedAt: release.published_at
      },
      platforms
    })
    
  } catch (error) {
    console.error('Error fetching GitHub releases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch release information' },
      { status: 500 }
    )
  }
}
