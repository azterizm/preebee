import sharp from 'sharp'
import fs from 'fs/promises'

(async () => {
  const images = await fs.readdir('./public/images/screenshots/')
  await Promise.all(
    images.map(image =>
      sharp('./public/images/screenshots/' + image)
        .resize({ width: 1280, height: 720, fit: 'contain', background: '#ffffff' })
        .toFile('./public/images/screenshots/converted_' + image)
    )
  )
})()
