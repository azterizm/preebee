import { Facebook, Instagram, Linkedin, Twitter, Youtube } from 'react-feather'

const data = [
  {
    'name': 'Facebook',
    logo: <Facebook />,
    'color': '#3b5998',
    placeholder: 'facebook.com/username',
  },
  {
    'name': 'Instagram',
    logo: <Instagram />,
    'color': '#c13584',
    placeholder: 'instagram.com/username',
  },
  {
    'name': 'Twitter',
    logo: <Twitter />,
    'color': '#1da1f2',
    placeholder: 'twitter.com/username',
  },
  {
    'name': 'LinkedIn',
    logo: <Linkedin />,
    'color': '#0077b5',
    placeholder: 'linkedin.com/in/username',
  },
  {
    'name': 'YouTube',
    logo: <Youtube />,
    'color': '#ff0000',
    placeholder: 'youtube.com/channel/username',
  },
  {
    'name': 'Snapchat',
    logo: (
      <img
        src='/icons/snapchat.png'
        className='invert'
        width={24}
        alt='Snapchat'
      />
    ),
    'color': '#b9b700',
    placeholder: 'snapchat.com/add/username',
  },
  {
    'name': 'Reddit',
    logo: (
      <img src='/icons/reddit.png' className='invert' width={24} alt='Reddit' />
    ),
    'color': '#ff4500',
    placeholder: 'reddit.com/user/username',
  },
  {
    'name': 'Pinterest',
    logo: (
      <img
        src='/icons/pinterest.png'
        alt='Pinterest'
        className='invert'
        width={24}
      />
    ),
    'color': '#bd081c',
    placeholder: 'pinterest.com/username',
  },
  {
    name: 'TikTok',
    logo: (
      <img
        className='invert'
        src='/icons/tiktok.svg'
        width={24}
        alt='TikTok'
      />
    ),
    color: '#000000',
    placeholder: 'tiktok.com/@username',
  },
  {
    name: 'WhatsApp',
    logo: (
      <img
        className='invert'
        src='/icons/whatsapp.png'
        width={24}
        alt='WhatsApp'
      />
    ),
    color: '#25d366',
    placeholder: 'wa.me/username',
  },
]

export default data
