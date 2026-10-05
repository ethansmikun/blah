'use client'

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  X,
} from 'lucide-react'

import { products, sizes, creatorCodes, shipping, maxQuantity, validCreatorCode } from '@/lib/catalog'
import { Modal } from '@/components/modal'

type CartItem = (typeof products)[number] & { size: string; quantity: number }

export default function Page() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [hasEntered, setHasEntered] = useState(false)
  const [isEntering, setIsEntering] = useState(false)
  const [isSiteRevealing, setIsSiteRevealing] = useState(false)
  const [isDropHighlighted, setIsDropHighlighted] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<(typeof products)[number] | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [activeSection, setActiveSection] = useState<'home' | 'shop' | 'catalog' | 'story' | 'contact' | 'checkout' | 'confirmation'>('home')
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [emailOpen, setEmailOpen] = useState(false)
  const [emailCopied, setEmailCopied] = useState(false)
  const [copyError, setCopyError] = useState('')

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart])

  useEffect(() => {
    if (hasEntered) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      document.querySelector<HTMLElement>('.site-header')?.focus({ preventScroll: true })
    }
  }, [activeSection, hasEntered])

  useEffect(() => {
    if (!hasEntered) return
    setIsSiteRevealing(true)
    const timer = window.setTimeout(() => setIsSiteRevealing(false), 900)
    return () => window.clearTimeout(timer)
  }, [hasEntered])

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  function addToCart(product: (typeof products)[number], size = selectedSize, quantity = selectedQuantity) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id && item.size === size)
      if (existing) return current.map((item) => item === existing ? { ...item, quantity: Math.min(maxQuantity, item.quantity + quantity) } : item)
      return [...current, { ...product, size, quantity: Math.min(maxQuantity, quantity) }]
    })
    setCartOpen(true)
    setSelectedProduct(null)
  }

  function updateQuantity(id: string, size: string, change: number) {
    setCart((current) => current.map((item) => item.id === id && item.size === size ? { ...item, quantity: Math.min(maxQuantity, Math.max(0, item.quantity + change)) } : item).filter((item) => item.quantity > 0))
  }

  function scrollTo(id: string) {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  function goToDrop() {
    setActiveSection('shop')
    setIsDropHighlighted(true)
    window.requestAnimationFrame(() => {
      document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.setTimeout(() => setIsDropHighlighted(false), 1400)
    })
  }

  function goToStayInLoop() {
    setActiveSection('home')
    window.requestAnimationFrame(() => document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  function enterStore() {
    if (isEntering) return
    setIsEntering(true)
    window.setTimeout(() => setHasEntered(true), 520)
  }

  return (
    <main className={`min-h-screen ${hasEntered ? 'site-entered' : 'site-locked'} ${isSiteRevealing ? 'site-revealing' : ''}`}>
      {!hasEntered && <Modal className={`entry-screen ${isEntering ? 'entry-exiting' : ''}`} label="Enter Swerve City" onClose={() => {}}><p className="entry-wordmark">SWERVE CITY</p><div className="entry-stage"><img src="/swerve-city-logo.png" alt="Swerve City" /><button className="entry-button" onClick={enterStore} disabled={isEntering}>Enter</button></div><div className="entry-socials" aria-label="Social media"><a href="https://instagram.com/swervecitybrandd" target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramIcon /></a><a href="https://tiktok.com/@SwerveCitybrand" target="_blank" rel="noreferrer" aria-label="TikTok"><TikTokIcon /></a></div><p className="entry-copyright">© 2026 SWERVE CITY</p></Modal>}
      
      <header className="site-header" tabIndex={-1}>
        <button className="icon-button" aria-label="Open menu" aria-expanded={menuOpen} aria-haspopup="dialog" onClick={() => setMenuOpen(true)}><Menu /></button>
        <button className="brand-mark" aria-label="Swerve City home" onClick={() => { setActiveSection('home'); scrollTo('top') }}><img src="/swerve-city-logo.png" alt="Swerve City" /></button>
        <div className="header-actions">
          <button className="icon-button desktop-only" aria-label="Search" onClick={() => setSearchOpen(true)}><Search /></button>
          <button className="cart-trigger" onClick={() => setCartOpen(true)} aria-label={`Open cart, ${itemCount} items`}><ShoppingBag /><span>{itemCount}</span></button>
        </div>
      </header>

      {emailOpen && <EmailModal copied={emailCopied} error={copyError} onClose={() => { setEmailOpen(false); setEmailCopied(false); setCopyError('') }} onCopy={async () => { try { await navigator.clipboard.writeText('Swervecitybrandd@gmail.com'); setEmailCopied(true); setCopyError('') } catch { setCopyError('Copy is unavailable. Select the email address or choose Open Mail.') } }} />}
      {searchOpen && <SearchOverlay query={searchQuery} setQuery={setSearchQuery} onClose={() => { setSearchOpen(false); setSearchQuery('') }} onOpen={(product) => { setSelectedProduct(product); setSelectedImageIndex(0); setSelectedSize('M'); setSearchOpen(false) }} />}

      {menuOpen && <Modal className="menu-overlay" label="Main menu" onClose={() => setMenuOpen(false)}>
        <nav className="menu-panel" onClick={(event) => event.stopPropagation()}>
          <div className="menu-top"><span>MENU</span><button className="icon-button" aria-label="Close menu" onClick={() => setMenuOpen(false)}><X /></button></div>
          <button onClick={() => { setActiveSection('home'); setMenuOpen(false); scrollTo('top') }}>Home</button>
          <button onClick={() => { setActiveSection('catalog'); setMenuOpen(false) }}>Shop all</button>
          <button onClick={() => { setActiveSection('story'); setMenuOpen(false) }}>Our story</button>
          <button onClick={() => { setActiveSection('contact'); setMenuOpen(false) }}>Contact</button>
          <div className="menu-footer">NYC / RIDE YOUR LINE<br />@SWERVECITYBRANDD</div>
        </nav>
      </Modal>}

      {activeSection === 'checkout' ? <Checkout cart={cart} subtotal={subtotal} onBack={() => { setActiveSection('home'); setCartOpen(true) }} onComplete={(result) => { setReceipt(result); setCart([]); setActiveSection('confirmation') }} /> : activeSection === 'confirmation' && receipt ? <Confirmation receipt={receipt} onHome={() => setActiveSection('home')} /> : activeSection === 'catalog' ? <Catalog items={products} onBack={() => setActiveSection('home')} onStayInLoop={goToStayInLoop} onOpen={(product) => { setSelectedProduct(product); setSelectedImageIndex(0); setSelectedSize('M') }} onAdd={(product) => { setSelectedProduct(product); setSelectedImageIndex(0); setSelectedSize('M') }} /> : activeSection === 'story' ? <StoryPage onBack={() => setActiveSection('home')} /> : activeSection === 'contact' ? <ContactPage onBack={() => setActiveSection('home')} onEmail={() => setEmailOpen(true)} /> : <>
        <section id="top" className="hero">
          <div className="hero-copy"><p className="eyebrow">NYC / EST. 2026</p><h1>Be different.<br /><em>Ride Swerve.</em></h1><p className="hero-description">Streetwear for the city in motion. Clean essentials, made to move with you.</p><button className="button button-black" onClick={goToDrop}>Shop the drop <ArrowRight /></button></div>
          <div className="hero-art"><img className="hero-logo" src="/swerve-city-logo.png" alt="Swerve City logo" /></div>
        </section>

        <section className="brand-carousel scroll-reveal" aria-label="Swerve City highlights"><div className="brand-carousel-track"><div className="brand-carousel-group">{['Rider owned', 'Drops every month', 'Limited drops'].map((message) => <span key={message}>{message}<b aria-hidden="true">✦</b></span>)}</div><div className="brand-carousel-group" aria-hidden="true">{['Rider owned', 'Drops every month', 'Limited drops'].map((message) => <span key={`repeat-${message}`}>{message}<b aria-hidden="true">✦</b></span>)}</div></div></section>

        <section id="shop" className={`shop-section section-pad scroll-reveal ${isDropHighlighted ? 'drop-highlight' : ''}`}>
          <div className="section-heading"><div><p className="eyebrow">THE ESSENTIALS</p><h2>Built for the<br /><em>everyday.</em></h2></div><button className="text-link" onClick={() => setActiveSection('catalog')}>View all <ArrowRight /></button></div>
          <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} onOpen={() => { setSelectedProduct(product); setSelectedImageIndex(0); setSelectedSize('M') }} onAdd={() => { setSelectedProduct(product); setSelectedImageIndex(0); setSelectedSize('M') }} />)}</div>
          <div className="coming-soon"><div><p className="eyebrow">UP NEXT / 03 / OCT 25, 2026</p><h3>Hoodies<br /><em>drop Oct 25.</em></h3></div><button className="coming-arrow" aria-label="Go to Stay in the loop" onClick={goToStayInLoop}><ArrowUpRight /></button></div>
        </section>

        <footer id="footer" className="site-footer scroll-reveal"><div className="footer-top"><div className="footer-logo"><img src="/swerve-city-logo.png" alt="Swerve City" /></div><div><p className="eyebrow">STAY IN THE LOOP</p><h3>New drops.<br /><em>No noise.</em></h3><button className="footer-email" onClick={() => setEmailOpen(true)}>Swervecitybrandd@gmail.com</button><a className="text-link" href="https://instagram.com/swervecitybrandd" target="_blank" rel="noreferrer">Follow for new drops <ArrowRight /></a></div></div><div className="footer-bottom"><span>© 2026 SWERVE CITY</span><span>NYC / WORLDWIDE</span><span className="footer-socials"><a href="https://instagram.com/swervecitybrandd" target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramIcon /></a><a href="https://tiktok.com/@SwerveCitybrand" target="_blank" rel="noreferrer" aria-label="TikTok"><TikTokIcon /></a></span></div></footer>
      </>}

      {selectedProduct && <div className="product-page" aria-label={`${selectedProduct.color} ${selectedProduct.name}`}><div className="product-detail"><button className="modal-close" aria-label="Back to shop" onClick={() => setSelectedProduct(null)}><X /></button><div className="detail-image"><img src={selectedProduct.images[selectedImageIndex]} alt={`${selectedProduct.color} Swerve City t-shirt view ${selectedImageIndex + 1}`} /><div className="detail-gallery-controls"><button aria-label="Previous product image" onClick={() => setSelectedImageIndex((selectedImageIndex - 1 + selectedProduct.images.length) % selectedProduct.images.length)}><ChevronLeft /></button><span>{selectedImageIndex + 1} / {selectedProduct.images.length}</span><button aria-label="Next product image" onClick={() => setSelectedImageIndex((selectedImageIndex + 1) % selectedProduct.images.length)}><ChevronRight /></button></div><div className="detail-thumbnails">{selectedProduct.images.map((image, index) => <button key={image} className={selectedImageIndex === index ? 'active' : ''} onClick={() => setSelectedImageIndex(index)}><img src={image} alt={`Select product view ${index + 1}`} /></button>)}</div></div><div className="detail-copy"><p className="eyebrow">SWERVE CITY / 01</p><h2>{selectedProduct.name}</h2><p className="detail-price">${selectedProduct.price}.00 USD</p><p className="detail-description">Heavyweight 240gsm cotton tee. Relaxed fit with a tonal Swerve City mark. Built for daily rotation.</p><p className="select-label">SELECT SIZE <span>Adult / Unisex</span></p><div className="size-row">{sizes.map((size) => <button key={size} aria-pressed={selectedSize === size} className={selectedSize === size ? 'size-button active' : 'size-button'} onClick={() => setSelectedSize(size)}>{size}</button>)}</div><p className="select-label quantity-label">QUANTITY</p><div className="order-quantity"><button aria-label="Decrease quantity" disabled={selectedQuantity <= 1} onClick={() => setSelectedQuantity((quantity) => Math.max(1, quantity - 1))}><Minus /></button><span aria-live="polite">{selectedQuantity}</span><button aria-label="Increase quantity" disabled={selectedQuantity >= maxQuantity} onClick={() => setSelectedQuantity((quantity) => Math.min(maxQuantity, quantity + 1))}><Plus /></button></div><p className="stock"><span /> In stock — universal 2-week shipping</p><button className="button button-black full" onClick={() => addToCart(selectedProduct)}>Add to cart <ArrowRight /></button></div></div></div>}

      {cartOpen && <CartDrawer cart={cart} subtotal={subtotal} onClose={() => setCartOpen(false)} onUpdate={updateQuantity} onCheckout={() => { setCartOpen(false); setActiveSection('checkout') }} />}
    </main>
  )
}

function EmailModal({ copied, error, onClose, onCopy }: { copied: boolean; error: string; onClose: () => void; onCopy: () => void }) {
  return <Modal className="email-modal" label="Contact Swerve City" onClose={onClose}><div className="email-dialog" onClick={(event) => event.stopPropagation()}><button className="modal-close" aria-label="Close email options" onClick={onClose}><X /></button><p className="eyebrow">CONTACT SWERVE CITY</p><h2 id="email-title">Email<br /><em>the city.</em></h2><p className="email-address">Swervecitybrandd@gmail.com</p><div className="email-actions"><button className="button button-black" onClick={onCopy}>{copied ? 'Copied' : 'Copy email'}</button><a className="button button-outline" href="mailto:Swervecitybrandd@gmail.com">Open Mail <ArrowRight /></a></div><p className="email-note" role="status">{error || (copied ? 'Email copied.' : 'On iPhone, choose Open Mail to start a new email.')}</p></div></Modal>
}

function SearchOverlay({ query, setQuery, onClose, onOpen }: { query: string; setQuery: (value: string) => void; onClose: () => void; onOpen: (product: (typeof products)[number]) => void }) {
  const results = products.filter((product) => `${product.name} ${product.color} ${product.blurb}`.toLowerCase().includes(query.toLowerCase()))
  return <Modal className="search-overlay" label="Search products" onClose={onClose}><div className="search-panel" onClick={(event) => event.stopPropagation()}><div className="search-top"><p className="eyebrow">SEARCH THE DROP</p><button className="icon-button" aria-label="Close search" onClick={onClose}><X /></button></div><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search shirts, colors..." aria-label="Search products" /><div className="search-results">{results.length ? results.map((product) => <button key={product.id} onClick={() => onOpen(product)}><img src={product.image} alt="" /><span><strong>{product.color} {product.name}</strong><small>${product.price}.00</small></span><ArrowRight /></button>) : <p className="search-empty">No products found.</p>}</div></div></Modal>
}

function Catalog({ items, onBack, onStayInLoop, onOpen, onAdd }: { items: typeof products; onBack: () => void; onStayInLoop: () => void; onOpen: (product: (typeof products)[number]) => void; onAdd: (product: (typeof products)[number]) => void }) {
  return <section className="catalog-page section-pad"><button className="back-link" onClick={onBack}><ArrowLeft /> Back home</button><div className="section-heading"><div><p className="eyebrow">THE FULL DROP</p><h1>Shop<br /><em>everything.</em></h1></div><p className="catalog-count">{items.length} essentials</p></div><div className="product-grid">{items.map((product) => <ProductCard key={product.id} product={product} onOpen={() => onOpen(product)} onAdd={() => onAdd(product)} />)}</div><div className="coming-soon"><div><p className="eyebrow">UP NEXT / 03 / OCT 25, 2026</p><h3>Hoodies<br /><em>drop Oct 25.</em></h3></div><button className="coming-arrow" aria-label="Go to Stay in the loop" onClick={onStayInLoop}><ArrowUpRight /></button></div></section>
}

function StoryPage({ onBack }: { onBack: () => void }) {
  return <section className="story-page section-pad"><button className="back-link" onClick={onBack}><ArrowLeft /> Back home</button><p className="eyebrow">THE SWERVE CITY CODE / 02</p><h1>For the ones<br />who <em>swerve.</em></h1><div className="story-page-copy"><p>Swerve City started with a simple belief: your route does not need to look like anyone else&apos;s. We make clean, heavyweight essentials for city riders, late-night thinkers, and people building their own direction.</p><p>Every drop is intentionally small, designed to be worn hard, and released on our own rhythm. No filler. No permission needed. Just pieces that move with you from first train to last light.</p><p>Rider owned and rooted in NYC, Swerve City is for the ones who choose the long way because it feels like theirs.</p></div><button className="button button-black" onClick={onBack}>Shop the drop <ArrowRight /></button></section>
}

function ContactPage({ onBack, onEmail }: { onBack: () => void; onEmail: () => void }) {
  return <section className="contact-page section-pad"><button className="back-link" onClick={onBack}><ArrowLeft /> Back home</button><p className="eyebrow">SWERVE CITY / CONTACT</p><h1>Stay<br /><em>connected.</em></h1><div className="contact-grid"><div><p className="contact-label">PAYMENT / APPLE CASH + ZELLE</p><a className="contact-value" href="tel:+19175166467">(917) 516-6467</a><p className="contact-note">Use this number for manual payment after placing an order.</p></div><div><p className="contact-label">EMAIL</p><button className="contact-value contact-email-button" onClick={onEmail}>Swervecitybrandd@gmail.com</button></div><div><p className="contact-label">SOCIAL</p><a className="contact-value social-contact-link" href="https://instagram.com/swervecitybrandd" target="_blank" rel="noreferrer"><InstagramIcon /> Instagram / @swervecitybrandd</a><a className="contact-value social-contact-link" href="https://tiktok.com/@SwerveCitybrand" target="_blank" rel="noreferrer"><TikTokIcon /> TikTok / @SwerveCitybrand</a></div></div></section>
}

function ProductCard({ product, onOpen, onAdd }: { product: (typeof products)[number]; onOpen: () => void; onAdd: () => void }) {
  return <article className="product-card"><button className="product-image product-gallery" onClick={onOpen} aria-label={`View ${product.color} ${product.name} images`}>{product.images.map((image, index) => <img key={image} className={`gallery-slide gallery-slide-${index}`} src={image} alt={index === 0 ? product.imageAlt : `${product.color} Swerve City t-shirt view ${index + 1}`} />)}</button><div className="product-meta"><div><h3>{product.name}</h3><p>{product.color} / {product.blurb}</p></div><strong>${product.price}</strong></div><button className="quick-add" onClick={onAdd}>Choose size <Plus /></button></article>
}

function CartDrawer({ cart, subtotal, onClose, onUpdate, onCheckout }: { cart: CartItem[]; subtotal: number; onClose: () => void; onUpdate: (id: string, size: string, change: number) => void; onCheckout: () => void }) {
  return <div className="cart-page" aria-label="Shopping cart"><div className="cart-page-inner"><div className="drawer-header"><div><p className="eyebrow">YOUR BAG</p><h2>Cart <span>({cart.reduce((n, item) => n + item.quantity, 0)})</span></h2></div><button className="icon-button" aria-label="Close cart" onClick={onClose}><X /></button></div>{cart.length === 0 ? <div className="empty-cart"><ShoppingBag /><p>Your cart is empty.</p><button className="text-link" onClick={onClose}>Keep shopping <ArrowRight /></button></div> : <><div className="cart-items">{cart.map((item) => <div className="cart-item" key={`${item.id}-${item.size}`}><img src={item.image} alt={item.imageAlt} /><div className="cart-item-copy"><h3>{item.name}</h3><p>Size / {item.size}</p><div className="item-row"><div className="quantity"><button aria-label={`Decrease ${item.color} ${item.size} quantity`} onClick={() => onUpdate(item.id, item.size, -1)}><Minus /></button><span>{item.quantity}</span><button aria-label={`Increase ${item.color} ${item.size} quantity`} disabled={item.quantity >= maxQuantity} onClick={() => onUpdate(item.id, item.size, 1)}><Plus /></button></div><strong>${item.price * item.quantity}.00</strong></div><button className="remove-item" onClick={() => onUpdate(item.id, item.size, -item.quantity)} aria-label={`Remove ${item.color} ${item.size}`}>Remove</button></div></div>)}</div><div className="drawer-summary"><div><span>Subtotal</span><strong>${subtotal}.00 USD</strong></div><p>$10 shipping added at checkout — 2 weeks.</p><button className="button button-black full" onClick={onCheckout}>Checkout <ArrowRight /></button><button className="button button-outline full" onClick={onClose}>Continue shopping</button></div></>}</div></div>
}

type Receipt = { orderId: string; total: number; paymentMethod: string }

function Checkout({ cart, subtotal, onBack, onComplete }: { cart: CartItem[]; subtotal: number; onBack: () => void; onComplete: (receipt: Receipt) => void }) {
  const [method, setMethod] = useState('Apple Cash')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [creatorCode, setCreatorCode] = useState('')
  const pendingRequest = useRef<{ payload: string; requestId: string } | null>(null)
  const submittingRef = useRef(false)
  const discountRate = validCreatorCode(creatorCode.trim()) ? 0.1 : 0
  const discount = Math.round(subtotal * discountRate * 100) / 100
  const orderTotal = subtotal - discount + shipping
  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submittingRef.current || !cart.length) return
    submittingRef.current = true
    setSubmitting(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const payload = JSON.stringify({ paymentMethod: method, creatorCode: creatorCode.trim(), customer: { name: form.get('name'), email: form.get('email'), address: form.get('address'), addressLine2: form.get('addressLine2'), city: form.get('city'), state: form.get('state'), zip: form.get('zip'), phone: form.get('phone') }, items: cart.map(({ id, size, quantity }) => ({ id, size, quantity })) })
    try {
      // Keep the same key when retrying an unchanged request after a lost response.
      if (pendingRequest.current?.payload !== payload) pendingRequest.current = { payload, requestId: crypto.randomUUID() }
      const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...JSON.parse(payload), requestId: pendingRequest.current.requestId }), signal: AbortSignal.timeout(20000) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'We could not send your order. Please try again.')
      if (!result.id || typeof result.orderId !== 'string' || !Number.isFinite(result.total) || result.total <= 0 || !['Apple Cash', 'Zelle'].includes(result.paymentMethod)) throw new Error('We could not verify the order response. Please retry before paying.')
      onComplete(result)
    } catch (cause) {
      setError(cause instanceof Error && cause.name === 'Error' ? cause.message : 'Connection interrupted. Please retry with the same details before paying; an unchanged retry will not send a duplicate order within 24 hours.')
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }
  if (!cart.length) return <section className="checkout-page section-pad"><h1>Your bag is empty.</h1><button className="button" onClick={onBack}>Back to bag</button></section>
  return <div className="checkout-page section-pad"><button className="back-link" onClick={onBack}><ArrowLeft /> Back to bag</button><div className="checkout-layout"><div><p className="eyebrow">CHECKOUT / SHIPPING</p><h1>Almost<br /><em>there.</em></h1><form className="checkout-form" onSubmit={submitOrder} aria-busy={submitting}><fieldset className="customer-fields" disabled={submitting}><label>Full name<input name="name" required autoComplete="name" placeholder="Your full name" /></label><label>Email address<input name="email" required autoComplete="email" type="email" placeholder="you@email.com" /></label><label>Street address<input name="address" required autoComplete="address-line1" placeholder="Street address" /></label><label>Apartment, suite, or unit <span>Optional</span><input name="addressLine2" autoComplete="address-line2" placeholder="Apartment, suite, or unit" /></label><div className="checkout-fields"><label>City<input name="city" required autoComplete="address-level2" placeholder="City" /></label><label>State<input name="state" required autoComplete="address-level1" placeholder="State" /></label><label>ZIP code<input name="zip" required autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{5}(-[0-9]{4})?" placeholder="ZIP code" /></label></div><label>Phone<input name="phone" required autoComplete="tel" type="tel" placeholder="(000) 000-0000" /></label><label>Creator code <span>Optional</span><input name="creatorCode" value={creatorCode} onChange={(event) => setCreatorCode(event.target.value)} autoComplete="off" placeholder="Enter creator code" /></label>{creatorCode && <p className={discountRate ? 'creator-code-success' : 'form-error'}>{discountRate ? `${creatorCodes[creatorCode.trim()]} code applied — 10% off` : 'Creator code not recognized'}</p>}<fieldset><legend>Payment method</legend><button type="button" aria-pressed={method === 'Apple Cash'} className={method === 'Apple Cash' ? 'payment-option active' : 'payment-option'} onClick={() => setMethod('Apple Cash')}><span className="radio" /> Apple Cash</button><button type="button" aria-pressed={method === 'Zelle'} className={method === 'Zelle' ? 'payment-option active' : 'payment-option'} onClick={() => setMethod('Zelle')}><span className="radio" /> Zelle</button></fieldset><p className="manual-note">Universal shipping is 2 weeks. No card processing. After you place your order, you&apos;ll receive exact manual payment instructions.</p>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-black full" type="submit" disabled={submitting || Boolean(creatorCode.trim() && !discountRate)}>{submitting ? 'Sending order…' : 'Place order'} {!submitting && <ArrowRight />}</button></fieldset></form></div><div className="checkout-summary"><p className="eyebrow">ORDER SUMMARY</p>{cart.map((item) => <div className="summary-item" key={`${item.id}-${item.size}`}><img src={item.image} alt="" /><div><strong>{item.name}</strong><span>{item.size} / Qty {item.quantity}</span></div><b>${item.price * item.quantity}.00</b></div>)}{discount > 0 && <div className="summary-discount"><span>Creator discount</span><strong>−${discount.toFixed(2)}</strong></div>}<div className="summary-shipping"><span>Universal shipping</span><strong>$10.00</strong></div><div className="summary-total"><span>Total</span><strong>${orderTotal.toFixed(2)} USD</strong></div></div></div></div>
}

function Confirmation({ receipt, onHome }: { receipt: Receipt; onHome: () => void }) {
  return <div className="confirmation"><div className="confirmation-mark"><Check /></div><p className="eyebrow">ORDER REQUEST SENT</p><h1>Thank you.<br /><em>Ride Swerve.</em></h1><p className="order-reference">Order {receipt.orderId}</p><p className="confirmation-copy">Your order request was accepted by our email service for delivery to Swerve City. Payment and availability still need to be confirmed manually. Save your order number and these instructions.</p><div className="payment-card"><p className="eyebrow">MANUAL PAYMENT / ${receipt.total.toFixed(2)} USD</p><h2>Send the exact total to<br /><strong>917 516 6467</strong></h2><p>through {receipt.paymentMethod}. Put your order number in the payment note.</p><div className="warning"><span>!</span><strong>Your order is not confirmed until payment is manually verified.</strong></div></div><p className="small-note">No payment screenshots are accepted. Questions? DM @swervecitybrandd.</p><button className="button button-black" onClick={onHome}>Back to home <ArrowRight /></button></div>
}

function ArrowUpRight() { return <ArrowRight className="arrow-up-right" /> }

function InstagramIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" /></svg>
}

function TikTokIcon() {
  return <svg className="tiktok-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.27-5.91 3.56-1.47.19-3-.13-4.27-.84-2.26-1.26-3.78-3.66-3.81-6.24-.02-.5-.03-1-.01-1.49.22-2.37 1.51-4.58 3.5-5.96 2.02-1.4 4.72-1.94 7.1-1.1.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.76-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.03 3.49 2.89 1.12-.01 2.18-.66 2.68-1.66.16-.27.23-.57.27-.86.07-1.54.04-3.07.05-4.61.01-3.43-.02-6.86.02-10.28z" /></svg>
}
