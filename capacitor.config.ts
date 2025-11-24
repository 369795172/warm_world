import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.businesslife.littleworld',
  appName: 'Little World',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
}

export default config

