export const products = [
  {
    id: 'white-tee',
    name: 'Swerve City T-shirt v1',
    color: 'White',
    price: 40,
    image: '/white-tee-front.jpg',
    images: ['/white-tee-front.jpg', '/white-tee-back.jpg', '/white-tee-detail.jpg'],
    imageAlt: 'White Swerve City t-shirt',
    blurb: 'Heavyweight cotton. Clean by design.',
    tag: 'Best seller',
  },
  {
    id: 'black-tee',
    name: 'Swerve City T-shirt v1',
    color: 'Black',
    price: 40,
    image: '/black-tee-front.jpg',
    images: ['/black-tee-front.jpg', '/black-tee-back.jpg', '/black-tee-detail.jpg'],
    imageAlt: 'Black Swerve City t-shirt',
    blurb: 'Heavyweight cotton. Built for the ride.',
    tag: 'New drop',
  },
]

export const sizes = ['S', 'M', 'L']


export const creatorCodes: Record<string, string> = { '98v_jai': 'Jai', 'Lbx_elias00': 'Elias', 'ethn.alexndr': 'Alex' }
export const shipping = 10
export const maxQuantity = 99
export function validCreatorCode(code: string) { return Object.hasOwn(creatorCodes, code) }
