'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Square, Circle, Type, Image as ImageIcon, Download, Trash2,
  Undo2, Redo2, AlignLeft, AlignCenter, AlignRight, Bold, Italic,
  Underline as UnderlineIcon, AlignJustify, Minus, Plus, Sparkles,
  RefreshCw, Star, Triangle, Layers, Copy, Send,
  ChevronsUp, ChevronUp, ChevronDown, ChevronsDown, Grid3X3,
  LayoutTemplate, Shapes, Palette, Wand2, Lock, Unlock,
  AlignVerticalJustifyCenter, AlignHorizontalJustifyCenter,
  AlignStartVertical, AlignEndVertical, AlignStartHorizontal, AlignEndHorizontal,
  FlipHorizontal2, FlipVertical2,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type FabricModule = typeof import('fabric')
type FabricCanvas = InstanceType<FabricModule['Canvas']>

type CanvasSize = { label: string; w: number; h: number; group: string }

type SelProps = {
  type: string
  x: number; y: number; w: number; h: number
  angle: number; opacity: number
  fill: string; stroke: string; strokeWidth: number
  fontFamily: string; fontSize: number
  fontWeight: string; fontStyle: string
  underline: boolean; linethrough: boolean
  textAlign: string; charSpacing: number; lineHeight: number
  locked: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CANVAS_SIZES: CanvasSize[] = [
  { group: 'Instagram', label: 'Square Post 1:1', w: 1080, h: 1080 },
  { group: 'Instagram', label: 'Portrait 4:5', w: 1080, h: 1350 },
  { group: 'Instagram / TikTok', label: 'Story 9:16', w: 1080, h: 1920 },
  { group: 'X (Twitter)', label: 'Twitter Post', w: 1600, h: 900 },
  { group: 'X (Twitter)', label: 'Twitter Banner', w: 1500, h: 500 },
  { group: 'LinkedIn', label: 'LinkedIn Post', w: 1200, h: 627 },
  { group: 'LinkedIn', label: 'LinkedIn Banner', w: 1584, h: 396 },
  { group: 'YouTube', label: 'YouTube Thumbnail', w: 1280, h: 720 },
  { group: 'Pinterest', label: 'Pinterest Pin', w: 1000, h: 1500 },
  { group: 'Facebook', label: 'Facebook Cover', w: 1640, h: 624 },
]

const FONTS = [
  'Inter', 'Playfair Display', 'Roboto', 'Montserrat', 'Poppins',
  'Lato', 'Oswald', 'Raleway', 'Open Sans', 'Georgia',
  'Helvetica Neue', 'Arial', 'Times New Roman', 'Courier New',
]

const PRESET_COLORS = [
  '#ffffff', '#f8f8f8', '#e5e5e5', '#aaaaaa', '#555555', '#222222', '#000000',
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
  '#fef3c7', '#dbeafe', '#f3e8ff', '#dcfce7', '#fee2e2', '#fff7ed', '#e0f2fe', '#fce7f3',
]

const GRADIENTS: Array<{ label: string; stops: [string, string] }> = [
  { label: 'Sunset', stops: ['#f97316', '#ec4899'] },
  { label: 'Ocean', stops: ['#3b82f6', '#06b6d4'] },
  { label: 'Forest', stops: ['#22c55e', '#14b8a6'] },
  { label: 'Royal', stops: ['#8b5cf6', '#3b82f6'] },
  { label: 'Fire', stops: ['#ef4444', '#f97316'] },
  { label: 'Night', stops: ['#1e1b4b', '#4c1d95'] },
  { label: 'Rose', stops: ['#f9a8d4', '#fbcfe8'] },
  { label: 'Gold', stops: ['#fbbf24', '#f59e0b'] },
  { label: 'Mint', stops: ['#86efac', '#67e8f9'] },
  { label: 'Dusk', stops: ['#374151', '#9ca3af'] },
]

const DEFAULT_SEL: SelProps = {
  type: '', x: 0, y: 0, w: 0, h: 0,
  angle: 0, opacity: 100,
  fill: '#3b82f6', stroke: 'transparent', strokeWidth: 0,
  fontFamily: 'Inter', fontSize: 32,
  fontWeight: 'normal', fontStyle: 'normal',
  underline: false, linethrough: false,
  textAlign: 'left', charSpacing: 0, lineHeight: 1.16,
  locked: false,
}

const TEMPLATES = [
  { id: 'minimal-quote', label: 'Minimal Quote',    preview: '#0f172a', accent: '#3ecfb2' },
  { id: 'bold-header',   label: 'Bold Header',      preview: '#1e293b', accent: '#3b82f6' },
  { id: 'announcement',  label: 'Announcement',     preview: '#2563eb', accent: '#ffffff' },
  { id: 'brand-card',    label: 'Brand Card',       preview: '#0f3460', accent: '#14b8a6' },
  { id: 'testimonial',   label: 'Testimonial',      preview: '#fafaf9', accent: '#8b5cf6' },
  { id: 'product',       label: 'Product Highlight', preview: '#eff6ff', accent: '#1d4ed8' },
  { id: 'tips',          label: 'Tips Post',        preview: '#052e16', accent: '#4ade80' },
  { id: 'event',         label: 'Event Promo',      preview: '#18181b', accent: '#a78bfa' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function CanvasEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<FabricCanvas | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const historyRef = useRef<string[]>([])
  const historyIdxRef = useRef(-1)
  const suppressHistRef = useRef(false)

  const [ready, setReady] = useState(false)
  const [selectedSize, setSelectedSize] = useState<CanvasSize>(CANVAS_SIZES[0])
  const [zoom, setZoom] = useState(0.45)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [showGrid, setShowGrid] = useState(false)
  const [snapGrid, setSnapGrid] = useState(false)
  const [sel, setSel] = useState<SelProps | null>(null)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [leftTab, setLeftTab] = useState('elements')
  const [layerList, setLayerList] = useState<Array<{ id: string; type: string }>>([])

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const calcScale = useCallback(() => {
    if (!containerRef.current) return 0.45
    const cw = containerRef.current.clientWidth - 80
    const ch = containerRef.current.clientHeight - 80
    return Math.min(cw / selectedSize.w, ch / selectedSize.h, 1)
  }, [selectedSize])

  const pushHistory = useCallback(() => {
    if (suppressHistRef.current) return
    const canvas = fabricRef.current
    if (!canvas) return
    const json = JSON.stringify(canvas.toJSON())
    historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1)
    historyRef.current.push(json)
    historyIdxRef.current = historyRef.current.length - 1
    setCanUndo(historyIdxRef.current > 0)
    setCanRedo(false)
  }, [])

  const refreshLayers = useCallback((canvas: FabricCanvas) => {
    const objs = canvas.getObjects()
    setLayerList(objs.slice().reverse().map((o, i) => ({
      id: String(i),
      type: (o as unknown as Record<string, unknown>)['name'] as string || o.type || 'Object',
    })))
  }, [])

  const syncSel = useCallback((canvas: FabricCanvas, scale: number) => {
    const obj = canvas.getActiveObject()
    if (!obj) { setSel(null); return }
    const isText = obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox'
    const o = obj as unknown as Record<string, unknown>
    setSel({
      type: obj.type ?? '',
      x: Math.round(((obj.left ?? 0) as number) / scale),
      y: Math.round(((obj.top ?? 0) as number) / scale),
      w: Math.round(obj.getScaledWidth() / scale),
      h: Math.round(obj.getScaledHeight() / scale),
      angle: Math.round((obj.angle ?? 0) as number),
      opacity: Math.round(((obj.opacity ?? 1) as number) * 100),
      fill: (typeof obj.fill === 'string' ? obj.fill : '#3b82f6') as string,
      stroke: ((obj.stroke ?? 'transparent') as string),
      strokeWidth: Math.round((obj.strokeWidth ?? 0) as number),
      fontFamily: isText ? (o['fontFamily'] as string ?? 'Inter') : DEFAULT_SEL.fontFamily,
      fontSize: isText ? Math.round((o['fontSize'] as number ?? 32) / scale) : DEFAULT_SEL.fontSize,
      fontWeight: isText ? (o['fontWeight'] as string ?? 'normal') : DEFAULT_SEL.fontWeight,
      fontStyle: isText ? (o['fontStyle'] as string ?? 'normal') : DEFAULT_SEL.fontStyle,
      underline: isText ? (o['underline'] as boolean ?? false) : false,
      linethrough: isText ? (o['linethrough'] as boolean ?? false) : false,
      textAlign: isText ? (o['textAlign'] as string ?? 'left') : DEFAULT_SEL.textAlign,
      charSpacing: isText ? (o['charSpacing'] as number ?? 0) : DEFAULT_SEL.charSpacing,
      lineHeight: isText ? (o['lineHeight'] as number ?? 1.16) : DEFAULT_SEL.lineHeight,
      locked: (o['locked'] as boolean ?? false),
    })
    refreshLayers(canvas)
  }, [refreshLayers])

  // ─── Canvas init ─────────────────────────────────────────────────────────

  useEffect(() => {
    let canvas: FabricCanvas | null = null
    let scale = 0.45

    // Load Google Fonts
    if (!document.querySelector('#design-fonts')) {
      const link = document.createElement('link')
      link.id = 'design-fonts'
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@400;700&family=Poppins:wght@400;700&family=Lato:wght@400;700&family=Oswald:wght@400;700&family=Raleway:wght@400;700&family=Open+Sans:wght@400;700&display=swap'
      document.head.appendChild(link)
    }

    import('fabric').then((module) => {
      if (!canvasRef.current) return
      scale = calcScale()
      setZoom(scale)

      canvas = new module.Canvas(canvasRef.current, {
        width: selectedSize.w * scale,
        height: selectedSize.h * scale,
        backgroundColor: '#ffffff',
        selection: true,
        preserveObjectStacking: true,
        stopContextMenu: true,
      })
      fabricRef.current = canvas

      canvas.on('object:modified', pushHistory)
      canvas.on('object:added', pushHistory)
      canvas.on('object:removed', pushHistory)

      canvas.on('selection:created', () => syncSel(canvas!, scale))
      canvas.on('selection:updated', () => syncSel(canvas!, scale))
      canvas.on('selection:cleared', () => { setSel(null); refreshLayers(canvas!) })
      canvas.on('object:modified', () => { syncSel(canvas!, scale); refreshLayers(canvas!) })

      canvas.on('object:moving', (e) => {
        if (!snapGrid || !e.target) return
        const GRID = 20 * scale
        e.target.set({
          left: Math.round((e.target.left ?? 0) / GRID) * GRID,
          top: Math.round((e.target.top ?? 0) / GRID) * GRID,
        })
      })

      historyRef.current = [JSON.stringify(canvas.toJSON())]
      historyIdxRef.current = 0
      setReady(true)
      refreshLayers(canvas)
    })

    return () => { canvas?.dispose() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSize])

  // ─── Keyboard shortcuts ───────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      const canvas = fabricRef.current
      if (!canvas) return
      const active = canvas.getActiveObject() as unknown as Record<string, unknown> | null
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (active && active['name'] !== 'background' && !active['locked'] && !active['isEditing']) {
          canvas.remove(canvas.getActiveObject()!)
          canvas.discardActiveObject()
          canvas.renderAll()
          setSel(null)
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') { e.preventDefault(); duplicateSelected() }
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowUp') { e.preventDefault(); bringForward() }
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowDown') { e.preventDefault(); sendBackward() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── Undo / Redo ─────────────────────────────────────────────────────────

  const undo = useCallback(async () => {
    if (historyIdxRef.current <= 0) return
    historyIdxRef.current--
    suppressHistRef.current = true
    const canvas = fabricRef.current
    if (!canvas) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (canvas as any).loadFromJSON(JSON.parse(historyRef.current[historyIdxRef.current]))
    canvas.renderAll()
    suppressHistRef.current = false
    setCanUndo(historyIdxRef.current > 0)
    setCanRedo(true)
    setSel(null)
    refreshLayers(canvas)
  }, [refreshLayers])

  const redo = useCallback(async () => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return
    historyIdxRef.current++
    suppressHistRef.current = true
    const canvas = fabricRef.current
    if (!canvas) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (canvas as any).loadFromJSON(JSON.parse(historyRef.current[historyIdxRef.current]))
    canvas.renderAll()
    suppressHistRef.current = false
    setCanUndo(true)
    setCanRedo(historyIdxRef.current < historyRef.current.length - 1)
    setSel(null)
    refreshLayers(canvas)
  }, [refreshLayers])

  // ─── Zoom ─────────────────────────────────────────────────────────────────

  const applyZoom = useCallback((newZoom: number) => {
    const canvas = fabricRef.current
    if (!canvas) return
    const clamped = Math.min(2, Math.max(0.15, newZoom))
    const ratio = clamped / zoom
    canvas.getObjects().forEach(obj => {
      obj.set({
        left: (obj.left ?? 0) * ratio,
        top: (obj.top ?? 0) * ratio,
        scaleX: (obj.scaleX ?? 1) * ratio,
        scaleY: (obj.scaleY ?? 1) * ratio,
      })
      obj.setCoords()
    })
    canvas.setDimensions({ width: selectedSize.w * clamped, height: selectedSize.h * clamped })
    canvas.renderAll()
    setZoom(clamped)
  }, [selectedSize.w, selectedSize.h, zoom])

  const fitCanvas = useCallback(() => applyZoom(calcScale()), [applyZoom, calcScale])

  // ─── Add elements ─────────────────────────────────────────────────────────

  const addRect = useCallback(async (rounded = false) => {
    const { Rect } = await import('fabric')
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.add(new Rect({
      left: 80 * zoom, top: 80 * zoom,
      width: 200 * zoom, height: 120 * zoom,
      fill: '#3b82f6', stroke: 'transparent', strokeWidth: 0,
      rx: rounded ? 14 * zoom : 0, ry: rounded ? 14 * zoom : 0,
    }))
    canvas.renderAll()
  }, [zoom])

  const addCircle = useCallback(async () => {
    const { Circle } = await import('fabric')
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.add(new Circle({
      left: 80 * zoom, top: 80 * zoom, radius: 70 * zoom,
      fill: '#22c55e', stroke: 'transparent', strokeWidth: 0,
    }))
    canvas.renderAll()
  }, [zoom])

  const addTriangle = useCallback(async () => {
    const { Triangle } = await import('fabric')
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.add(new Triangle({
      left: 80 * zoom, top: 80 * zoom,
      width: 160 * zoom, height: 140 * zoom,
      fill: '#f97316', stroke: 'transparent', strokeWidth: 0,
    }))
    canvas.renderAll()
  }, [zoom])

  const addLine = useCallback(async () => {
    const { Line } = await import('fabric')
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.add(new Line([60 * zoom, 200 * zoom, 460 * zoom, 200 * zoom], {
      stroke: '#334155', strokeWidth: 3 * zoom, fill: 'transparent',
    }))
    canvas.renderAll()
  }, [zoom])

  const addStar = useCallback(async () => {
    const { Polygon } = await import('fabric')
    const canvas = fabricRef.current
    if (!canvas) return
    const n = 5
    const r1 = 80 * zoom, r2 = 34 * zoom
    const pts = Array.from({ length: n * 2 }, (_, i) => {
      const angle = (Math.PI / n) * i - Math.PI / 2
      const r = i % 2 === 0 ? r1 : r2
      return { x: Math.cos(angle) * r, y: Math.sin(angle) * r }
    })
    canvas.add(new Polygon(pts, {
      left: 100 * zoom, top: 80 * zoom,
      fill: '#eab308', stroke: 'transparent', strokeWidth: 0,
    }))
    canvas.renderAll()
  }, [zoom])

  const addText = useCallback(async (variant: 'heading' | 'subheading' | 'body' | 'caption') => {
    const { IText } = await import('fabric')
    const canvas = fabricRef.current
    if (!canvas) return
    const configs = {
      heading:    { text: 'Your Heading',   size: 72,  weight: 'bold',   fill: '#0f172a' },
      subheading: { text: 'Your Subheading', size: 40, weight: 'normal', fill: '#334155' },
      body:       { text: 'Add your body text here.\nKeep it short and impactful.', size: 22, weight: 'normal', fill: '#64748b' },
      caption:    { text: 'Caption text',   size: 14,  weight: 'normal', fill: '#94a3b8' },
    }
    const cfg = configs[variant]
    const obj = new IText(cfg.text, {
      left: 80 * zoom, top: 120 * zoom,
      fontSize: cfg.size * zoom, fontWeight: cfg.weight,
      fill: cfg.fill, fontFamily: 'Inter, sans-serif',
    })
    canvas.add(obj)
    canvas.setActiveObject(obj)
    canvas.renderAll()
  }, [zoom])

  const addImage = useCallback(async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const url = URL.createObjectURL(file)
      const { FabricImage } = await import('fabric')
      const canvas = fabricRef.current
      if (!canvas) return
      const img = await FabricImage.fromURL(url)
      const maxW = selectedSize.w * zoom * 0.7
      if ((img.width ?? 0) > maxW) img.scaleToWidth(maxW)
      img.set({ left: 50 * zoom, top: 50 * zoom })
      canvas.add(img)
      canvas.setActiveObject(img)
      canvas.renderAll()
    }
    input.click()
  }, [zoom, selectedSize.w])

  // ─── Background ───────────────────────────────────────────────────────────

  const setBackground = useCallback((color: string) => {
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.set('backgroundColor', color)
    canvas.renderAll()
    setBgColor(color)
    pushHistory()
  }, [pushHistory])

  const setBackgroundGradient = useCallback(async (stops: [string, string]) => {
    const { Gradient } = await import('fabric')
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.set('backgroundColor', new Gradient({
      type: 'linear',
      coords: { x1: 0, y1: 0, x2: canvas.width ?? 500, y2: canvas.height ?? 500 },
      colorStops: [{ offset: 0, color: stops[0] }, { offset: 1, color: stops[1] }],
    }) as unknown as string)
    canvas.renderAll()
    setBgColor(`gradient:${stops.join(',')}`)
    pushHistory()
  }, [pushHistory])

  // ─── Object operations ────────────────────────────────────────────────────

  const deleteSelected = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    const obj = canvas.getActiveObject() as unknown as Record<string, unknown> | null
    if (obj && obj['name'] !== 'background' && !obj['locked']) {
      canvas.remove(canvas.getActiveObject()!)
      canvas.discardActiveObject()
      canvas.renderAll()
      setSel(null)
    }
  }, [])

  const duplicateSelected = useCallback(async () => {
    const canvas = fabricRef.current
    if (!canvas) return
    const obj = canvas.getActiveObject()
    if (!obj) return
    const cloned = await obj.clone()
    cloned.set({ left: (obj.left ?? 0) + 20 * zoom, top: (obj.top ?? 0) + 20 * zoom })
    canvas.add(cloned)
    canvas.setActiveObject(cloned)
    canvas.renderAll()
  }, [zoom])

  const flipH = useCallback(() => {
    const obj = fabricRef.current?.getActiveObject()
    if (!obj) return
    obj.set('flipX', !obj.flipX)
    fabricRef.current?.renderAll()
    pushHistory()
  }, [pushHistory])

  const flipV = useCallback(() => {
    const obj = fabricRef.current?.getActiveObject()
    if (!obj) return
    obj.set('flipY', !obj.flipY)
    fabricRef.current?.renderAll()
    pushHistory()
  }, [pushHistory])

  const align = useCallback((dir: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    const canvas = fabricRef.current
    const obj = canvas?.getActiveObject()
    if (!canvas || !obj) return
    const cw = canvas.width ?? 0, ch = canvas.height ?? 0
    const bw = obj.getScaledWidth(), bh = obj.getScaledHeight()
    switch (dir) {
      case 'left':   obj.set({ left: 0 });             break
      case 'center': obj.set({ left: (cw - bw) / 2 }); break
      case 'right':  obj.set({ left: cw - bw });        break
      case 'top':    obj.set({ top: 0 });               break
      case 'middle': obj.set({ top: (ch - bh) / 2 });  break
      case 'bottom': obj.set({ top: ch - bh });         break
    }
    obj.setCoords()
    canvas.renderAll()
    pushHistory()
  }, [pushHistory])

  const bringFront   = useCallback(() => { const c = fabricRef.current; const o = c?.getActiveObject(); if (c && o) { c.bringObjectToFront(o);  c.renderAll(); pushHistory() } }, [pushHistory])
  const bringForward = useCallback(() => { const c = fabricRef.current; const o = c?.getActiveObject(); if (c && o) { c.bringObjectForward(o);  c.renderAll(); pushHistory() } }, [pushHistory])
  const sendBackward = useCallback(() => { const c = fabricRef.current; const o = c?.getActiveObject(); if (c && o) { c.sendObjectBackwards(o); c.renderAll(); pushHistory() } }, [pushHistory])
  const sendBack     = useCallback(() => { const c = fabricRef.current; const o = c?.getActiveObject(); if (c && o) { c.sendObjectToBack(o);    c.renderAll(); pushHistory() } }, [pushHistory])

  const toggleLock = useCallback(() => {
    const canvas = fabricRef.current
    const obj = canvas?.getActiveObject() as unknown as Record<string, unknown> | null
    if (!obj) return
    const locked = !(obj['locked'] as boolean ?? false)
    obj['locked']          = locked
    obj['selectable']      = !locked
    obj['evented']         = !locked
    obj['lockMovementX']   = locked
    obj['lockMovementY']   = locked
    obj['lockRotation']    = locked
    obj['lockScalingX']    = locked
    obj['lockScalingY']    = locked
    canvas?.renderAll()
    setSel(s => s ? { ...s, locked } : null)
  }, [])

  // ─── Update object property ───────────────────────────────────────────────

  const updateProp = useCallback((prop: string, value: unknown) => {
    const canvas = fabricRef.current
    const obj = canvas?.getActiveObject()
    if (!canvas || !obj) return
    ;(obj as unknown as Record<string, unknown>)[prop] = value
    obj.setCoords()
    canvas.requestRenderAll()
    setSel(s => s ? { ...s, [prop]: value } as SelProps : null)
  }, [])

  // ─── Export ───────────────────────────────────────────────────────────────

  const exportCanvas = useCallback((format: 'png' | 'jpeg') => {
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.discardActiveObject()
    canvas.renderAll()
    const dataURL = canvas.toDataURL({ format, quality: format === 'jpeg' ? 0.92 : 1, multiplier: 1 / zoom })
    const a = document.createElement('a')
    a.href = dataURL
    a.download = `design.${format}`
    a.click()
    toast.success(`Exported as ${format.toUpperCase()}`)
  }, [zoom])

  const sendToCompose = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.discardActiveObject()
    canvas.renderAll()
    const dataURL = canvas.toDataURL({ format: 'png', multiplier: 1 })
    try {
      sessionStorage.setItem('design-export', dataURL)
      toast.success('Design exported — opening Compose…')
      setTimeout(() => { window.location.href = '/dashboard/compose?from=design' }, 700)
    } catch {
      // Fallback if sessionStorage too full
      exportCanvas('png')
    }
  }, [zoom, exportCanvas])

  // ─── AI image ────────────────────────────────────────────────────────────

  const generateAI = useCallback(async () => {
    if (!aiPrompt.trim() || aiGenerating) return
    setAiGenerating(true)
    try {
      const res = await fetch('/api/ai/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'image', content: aiPrompt, imagePrompt: aiPrompt }),
      })
      const data = await res.json() as { url?: string; error?: string }
      if (!data.url) throw new Error(data.error ?? 'No image returned')
      const { FabricImage } = await import('fabric')
      const canvas = fabricRef.current
      if (!canvas) return
      const img = await FabricImage.fromURL(data.url, { crossOrigin: 'anonymous' })
      img.scaleToWidth(selectedSize.w * zoom * 0.8)
      img.set({ left: selectedSize.w * zoom * 0.1, top: selectedSize.h * zoom * 0.1 })
      canvas.add(img)
      canvas.setActiveObject(img)
      canvas.renderAll()
      setAiPrompt('')
      toast.success('AI image added to canvas')
    } catch {
      toast.error('Image generation failed')
    } finally {
      setAiGenerating(false)
    }
  }, [aiPrompt, aiGenerating, zoom, selectedSize.w, selectedSize.h])

  // ─── Templates ───────────────────────────────────────────────────────────

  const applyTemplate = useCallback(async (id: string) => {
    const canvas = fabricRef.current
    if (!canvas) return
    suppressHistRef.current = true
    canvas.clear()
    const { IText, Rect, Circle } = await import('fabric')
    const W = canvas.width ?? 500
    const H = canvas.height ?? 500
    const s = zoom
    const add = (obj: object) => canvas.add(obj as never)

    switch (id) {
      case 'minimal-quote': {
        canvas.set('backgroundColor', '#0f172a')
        add(new Rect({ left: W*0.08, top: H*0.42, width: W*0.06, height: 4*s, fill: '#3ecfb2', selectable: false }))
        add(new IText('"Your most inspiring quote\ngoes right here on this line."', { left: W*0.08, top: H*0.48, fontSize: 30*s, fill: '#f8fafc', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.4 }))
        add(new IText('— Author Name', { left: W*0.08, top: H*0.7, fontSize: 15*s, fill: '#94a3b8', fontFamily: 'Inter, sans-serif' }))
        add(new IText('YOUR BRAND', { left: W*0.08, top: H*0.88, fontSize: 12*s, fill: '#3ecfb2', fontFamily: 'Inter, sans-serif', fontWeight: 'bold', charSpacing: 300 }))
        break
      }
      case 'bold-header': {
        canvas.set('backgroundColor', '#f8fafc')
        add(new Rect({ left: 0, top: 0, width: W, height: H*0.52, fill: '#1e293b', selectable: false }))
        add(new IText('BIG BOLD\nSTATEMENT', { left: W*0.08, top: H*0.1, fontSize: 52*s, fontWeight: 'bold', fill: '#f8fafc', fontFamily: 'Inter, sans-serif', lineHeight: 1.1 }))
        add(new IText('Your subtitle or key message goes\non this important line below.', { left: W*0.08, top: H*0.6, fontSize: 20*s, fill: '#334155', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }))
        add(new Rect({ left: W*0.08, top: H*0.84, width: 160*s, height: 44*s, fill: '#3b82f6', rx: 6*s, ry: 6*s }))
        add(new IText('Learn More →', { left: W*0.105, top: H*0.856, fontSize: 15*s, fill: '#ffffff', fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }))
        break
      }
      case 'announcement': {
        canvas.set('backgroundColor', '#2563eb')
        add(new Circle({ left: -W*0.35, top: -H*0.35, radius: W*0.65, fill: 'rgba(255,255,255,0.06)', selectable: false }))
        add(new Circle({ left: W*0.55, top: H*0.45, radius: W*0.5, fill: 'rgba(255,255,255,0.04)', selectable: false }))
        add(new IText('🎉  ANNOUNCEMENT', { left: W*0.08, top: H*0.1, fontSize: 16*s, fill: 'rgba(255,255,255,0.85)', fontFamily: 'Inter, sans-serif', fontWeight: 'bold', charSpacing: 250 }))
        add(new IText('Your Big\nNews Here!', { left: W*0.08, top: H*0.26, fontSize: 56*s, fontWeight: 'bold', fill: '#ffffff', fontFamily: 'Inter, sans-serif', lineHeight: 1.1 }))
        add(new IText('Share more context about this exciting\nnews with your audience here.', { left: W*0.08, top: H*0.72, fontSize: 19*s, fill: 'rgba(255,255,255,0.85)', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }))
        break
      }
      case 'brand-card': {
        canvas.set('backgroundColor', '#0f3460')
        add(new Rect({ left: 0, top: H*0.79, width: W, height: H*0.21, fill: '#14b8a6', selectable: false }))
        add(new Circle({ left: W*0.06, top: H*0.09, radius: 40*s, fill: 'rgba(20,184,166,0.25)', selectable: false }))
        add(new IText('BRAND', { left: W*0.08, top: H*0.15, fontSize: 58*s, fontWeight: 'bold', fill: '#14b8a6', fontFamily: 'Inter, sans-serif', charSpacing: 300 }))
        add(new IText('NAME', { left: W*0.08, top: H*0.35, fontSize: 58*s, fontWeight: 'bold', fill: '#ffffff', fontFamily: 'Inter, sans-serif', charSpacing: 300 }))
        add(new IText('Your tagline goes here.\nMake it memorable.', { left: W*0.08, top: H*0.57, fontSize: 19*s, fill: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }))
        add(new IText('www.yourbrand.com', { left: W*0.08, top: H*0.84, fontSize: 15*s, fill: '#0f3460', fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }))
        break
      }
      case 'testimonial': {
        canvas.set('backgroundColor', '#fafaf9')
        add(new Rect({ left: W*0.05, top: H*0.05, width: W*0.9, height: H*0.9, fill: '#ffffff', stroke: '#e7e5e4', strokeWidth: 1.5*s, rx: 16*s, ry: 16*s }))
        add(new IText('❝', { left: W*0.1, top: H*0.1, fontSize: 70*s, fill: '#8b5cf6', fontFamily: 'Georgia, serif' }))
        add(new IText('"This product completely\ntransformed how our team\nworks. Absolutely loved it!"', { left: W*0.1, top: H*0.3, fontSize: 21*s, fill: '#1c1917', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6 }))
        add(new IText('⭐⭐⭐⭐⭐', { left: W*0.1, top: H*0.63, fontSize: 20*s, fill: '#f59e0b' }))
        add(new Circle({ left: W*0.1, top: H*0.73, radius: 24*s, fill: '#8b5cf6' }))
        add(new IText('Jane Smith, CEO — Acme Corp', { left: W*0.23, top: H*0.74, fontSize: 13*s, fill: '#44403c', fontFamily: 'Inter, sans-serif' }))
        break
      }
      case 'product': {
        canvas.set('backgroundColor', '#eff6ff')
        add(new Rect({ left: 0, top: H*0.56, width: W, height: H*0.44, fill: '#1d4ed8', selectable: false }))
        add(new IText('NEW ARRIVAL', { left: W*0.08, top: H*0.07, fontSize: 12*s, fill: '#2563eb', fontFamily: 'Inter, sans-serif', fontWeight: 'bold', charSpacing: 300 }))
        add(new IText('Product\nName', { left: W*0.08, top: H*0.15, fontSize: 52*s, fontWeight: 'bold', fill: '#0c4a6e', fontFamily: 'Inter, sans-serif', lineHeight: 1.1 }))
        add(new IText('Key benefit or feature\nhighlighted right here.', { left: W*0.08, top: H*0.42, fontSize: 18*s, fill: '#1d4ed8', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }))
        add(new IText('Shop Now →', { left: W*0.08, top: H*0.64, fontSize: 22*s, fontWeight: 'bold', fill: '#ffffff', fontFamily: 'Inter, sans-serif' }))
        add(new IText('yourstore.com', { left: W*0.08, top: H*0.83, fontSize: 14*s, fill: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif' }))
        break
      }
      case 'tips': {
        canvas.set('backgroundColor', '#052e16')
        add(new Circle({ left: -W*0.12, top: -H*0.12, radius: W*0.55, fill: 'rgba(34,197,94,0.08)', selectable: false }))
        add(new IText('💡  3 TIPS FOR', { left: W*0.08, top: H*0.07, fontSize: 15*s, fill: '#4ade80', fontFamily: 'Inter, sans-serif', fontWeight: 'bold', charSpacing: 200 }))
        add(new IText('Topic\nTitle', { left: W*0.08, top: H*0.15, fontSize: 52*s, fontWeight: 'bold', fill: '#f0fdf4', fontFamily: 'Inter, sans-serif', lineHeight: 1.1 }))
        for (let i = 0; i < 3; i++) {
          add(new Rect({ left: W*0.08, top: H*(0.47+i*0.155), width: W*0.84, height: H*0.12, fill: 'rgba(74,222,128,0.08)', rx: 8*s, ry: 8*s }))
          add(new IText(`${i+1}. Your tip title here`, { left: W*0.13, top: H*(0.5+i*0.155), fontSize: 16*s, fill: '#f0fdf4', fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }))
        }
        break
      }
      case 'event': {
        canvas.set('backgroundColor', '#18181b')
        add(new Rect({ left: 0, top: 0, width: W, height: H, fill: 'transparent', stroke: '#a78bfa', strokeWidth: 5*s, selectable: false }))
        add(new IText('📅  UPCOMING EVENT', { left: W*0.08, top: H*0.09, fontSize: 13*s, fill: '#a78bfa', fontFamily: 'Inter, sans-serif', fontWeight: 'bold', charSpacing: 280 }))
        add(new IText('Event\nTitle Here', { left: W*0.08, top: H*0.2, fontSize: 54*s, fontWeight: 'bold', fill: '#fafafa', fontFamily: 'Inter, sans-serif', lineHeight: 1.1 }))
        add(new Rect({ left: W*0.08, top: H*0.58, width: W*0.84, height: 1, fill: '#3f3f46' }))
        add(new IText('📍 Venue Name, City', { left: W*0.08, top: H*0.64, fontSize: 15*s, fill: '#a1a1aa', fontFamily: 'Inter, sans-serif' }))
        add(new IText('🗓  Month DD, YYYY  ·  HH:MM PM', { left: W*0.08, top: H*0.72, fontSize: 15*s, fill: '#a1a1aa', fontFamily: 'Inter, sans-serif' }))
        add(new Rect({ left: W*0.08, top: H*0.83, width: 180*s, height: 44*s, fill: '#a78bfa', rx: 22*s, ry: 22*s }))
        add(new IText('Register Now', { left: W*0.115, top: H*0.847, fontSize: 15*s, fill: '#18181b', fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }))
        break
      }
    }
    canvas.renderAll()
    suppressHistRef.current = false
    pushHistory()
    refreshLayers(canvas)
    toast.success('Template applied')
  }, [zoom, pushHistory, refreshLayers])

  // ─── Render ───────────────────────────────────────────────────────────────

  const isText = sel ? (sel.type === 'i-text' || sel.type === 'text' || sel.type === 'textbox') : false

  return (
    <TooltipProvider>
      <div className="flex flex-col h-[calc(100vh-4.5rem)] bg-background">

        {/* ══ TOP TOOLBAR ═══════════════════════════════════════════════════ */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-border bg-card flex-shrink-0 flex-wrap">

          {/* Canvas size selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-2 border-border min-w-[148px] justify-between">
                <span className="truncate">{selectedSize.label}</span>
                <span className="text-muted-foreground/50 text-[9px] shrink-0">{selectedSize.w}×{selectedSize.h}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="start">
              {CANVAS_SIZES.map(size => (
                <DropdownMenuItem key={size.label} onClick={() => setSelectedSize(size)}
                  className={cn('text-xs', size.label === selectedSize.label && 'text-accent')}>
                  <span className="flex-1">{size.label}</span>
                  <span className="text-muted-foreground text-[10px] ml-2">{size.w}×{size.h}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-5" />

          {/* Undo / Redo */}
          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={undo} disabled={!canUndo}>
              <Undo2 className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger><TooltipContent side="bottom">Undo (Ctrl+Z)</TooltipContent></Tooltip>

          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={redo} disabled={!canRedo}>
              <Redo2 className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger><TooltipContent side="bottom">Redo (Ctrl+Y)</TooltipContent></Tooltip>

          <Separator orientation="vertical" className="h-5" />

          {/* Zoom controls */}
          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => applyZoom(zoom - 0.1)}>
              <Minus className="w-3 h-3" />
            </Button>
          </TooltipTrigger><TooltipContent side="bottom">Zoom Out</TooltipContent></Tooltip>

          <span className="text-xs text-muted-foreground w-9 text-center tabular-nums select-none">
            {Math.round(zoom * 100)}%
          </span>

          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => applyZoom(zoom + 0.1)}>
              <Plus className="w-3 h-3" />
            </Button>
          </TooltipTrigger><TooltipContent side="bottom">Zoom In</TooltipContent></Tooltip>

          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-medium" onClick={fitCanvas}>
              Fit
            </Button>
          </TooltipTrigger><TooltipContent side="bottom">Fit to window</TooltipContent></Tooltip>

          {/* Contextual: alignment + flip when selection active */}
          {sel && (
            <>
              <Separator orientation="vertical" className="h-5" />
              {([
                { dir: 'left'   as const, Icon: AlignStartVertical,          tip: 'Align Left' },
                { dir: 'center' as const, Icon: AlignHorizontalJustifyCenter, tip: 'Center Horizontal' },
                { dir: 'right'  as const, Icon: AlignEndVertical,            tip: 'Align Right' },
                { dir: 'top'    as const, Icon: AlignStartHorizontal,         tip: 'Align Top' },
                { dir: 'middle' as const, Icon: AlignVerticalJustifyCenter,   tip: 'Center Vertical' },
                { dir: 'bottom' as const, Icon: AlignEndHorizontal,          tip: 'Align Bottom' },
              ]).map(({ dir, Icon, tip }) => (
                <Tooltip key={dir}><TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => align(dir)}>
                    <Icon className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger><TooltipContent side="bottom">{tip}</TooltipContent></Tooltip>
              ))}
              <Separator orientation="vertical" className="h-5" />
              <Tooltip><TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={flipH}>
                  <FlipHorizontal2 className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger><TooltipContent side="bottom">Flip Horizontal</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={flipV}>
                  <FlipVertical2 className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger><TooltipContent side="bottom">Flip Vertical</TooltipContent></Tooltip>
            </>
          )}

          <div className="flex-1" />

          {/* Grid & Snap toggles */}
          <Tooltip><TooltipTrigger asChild>
            <Button variant={showGrid ? 'secondary' : 'ghost'} size="sm" className="h-7 w-7 p-0" onClick={() => setShowGrid(g => !g)}>
              <Grid3X3 className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger><TooltipContent side="bottom">Toggle grid</TooltipContent></Tooltip>

          <Tooltip><TooltipTrigger asChild>
            <Button variant={snapGrid ? 'secondary' : 'ghost'} size="sm" className="h-7 px-2 text-[10px] font-medium" onClick={() => setSnapGrid(g => !g)}>
              Snap
            </Button>
          </TooltipTrigger><TooltipContent side="bottom">Snap to grid (20px)</TooltipContent></Tooltip>

          <Separator orientation="vertical" className="h-5" />

          {/* Export dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs border-border">
                <Download className="w-3.5 h-3.5" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportCanvas('png')} className="text-xs gap-2">
                <Download className="w-3.5 h-3.5" /> PNG (lossless)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportCanvas('jpeg')} className="text-xs gap-2">
                <Download className="w-3.5 h-3.5" /> JPEG (smaller)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={sendToCompose} className="text-xs gap-2 text-accent">
                <Send className="w-3.5 h-3.5" /> Send to Compose
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" className="h-7 gap-1.5 text-xs bg-accent hover:bg-accent/90" onClick={sendToCompose}>
            <Send className="w-3.5 h-3.5" /> Use in Post
          </Button>
        </div>

        {/* ══ THREE-COLUMN BODY ═════════════════════════════════════════════ */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* ── LEFT PANEL ──────────────────────────────────────────────── */}
          <div className="w-52 flex-shrink-0 border-r border-border bg-card overflow-y-auto">
            <Tabs value={leftTab} onValueChange={setLeftTab}>
              <TabsList className="w-full rounded-none border-b border-border bg-transparent h-9 p-0 grid grid-cols-5">
                {([
                  { v: 'elements',  Icon: Shapes,        tip: 'Shapes' },
                  { v: 'text',      Icon: Type,          tip: 'Text' },
                  { v: 'bg',        Icon: Palette,       tip: 'Background' },
                  { v: 'templates', Icon: LayoutTemplate, tip: 'Templates' },
                  { v: 'ai',        Icon: Wand2,         tip: 'AI Generate' },
                ] as const).map(({ v, Icon, tip }) => (
                  <Tooltip key={v}><TooltipTrigger asChild>
                    <TabsTrigger value={v}
                      className="rounded-none h-full data-[state=active]:bg-accent/10 data-[state=active]:text-accent data-[state=active]:shadow-none text-muted-foreground">
                      <Icon className="w-3.5 h-3.5" />
                    </TabsTrigger>
                  </TooltipTrigger><TooltipContent side="bottom">{tip}</TooltipContent></Tooltip>
                ))}
              </TabsList>

              {/* ─ SHAPES & MEDIA ─ */}
              <TabsContent value="elements" className="mt-0 p-3 space-y-4">
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2">Shapes</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {([
                      { label: 'Rect',     action: () => addRect(false), Icon: Square },
                      { label: 'Rounded',  action: () => addRect(true),  Icon: Square },
                      { label: 'Circle',   action: addCircle,            Icon: Circle },
                      { label: 'Triangle', action: addTriangle,          Icon: Triangle },
                      { label: 'Line',     action: addLine,              Icon: Minus },
                      { label: 'Star',     action: addStar,              Icon: Star },
                    ]).map(({ label, action, Icon }) => (
                      <button key={label} onClick={action} disabled={!ready}
                        className="flex flex-col items-center gap-1 py-2.5 rounded border border-border bg-background hover:bg-accent/5 hover:border-accent/30 transition-colors disabled:opacity-40 text-[9px] text-muted-foreground">
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2">Media</p>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-8 border-border" onClick={addImage} disabled={!ready}>
                    <ImageIcon className="w-3.5 h-3.5" /> Upload Image
                  </Button>
                </div>
              </TabsContent>

              {/* ─ TEXT ─ */}
              <TabsContent value="text" className="mt-0 p-3 space-y-1.5">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2">Text Styles</p>
                {([
                  { label: 'Add a Heading',    variant: 'heading'    as const, cls: 'text-sm font-bold' },
                  { label: 'Add a Subheading', variant: 'subheading' as const, cls: 'text-xs font-medium' },
                  { label: 'Add Body Text',    variant: 'body'       as const, cls: 'text-xs' },
                  { label: 'Add a Caption',    variant: 'caption'    as const, cls: 'text-[10px]' },
                ]).map(({ label, variant, cls }) => (
                  <button key={variant} onClick={() => addText(variant)} disabled={!ready}
                    className={cn('w-full text-left px-3 py-2.5 rounded border border-border bg-background hover:bg-accent/5 hover:border-accent/30 transition-colors disabled:opacity-40 text-foreground', cls)}>
                    {label}
                  </button>
                ))}
                <Separator className="my-2" />
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2">Font Preview</p>
                {(['Playfair Display', 'Montserrat', 'Oswald', 'Lato'] as const).map(f => (
                  <div key={f} className="text-xs text-muted-foreground px-1 leading-relaxed" style={{ fontFamily: f }}>{f}</div>
                ))}
              </TabsContent>

              {/* ─ BACKGROUND ─ */}
              <TabsContent value="bg" className="mt-0 p-3 space-y-4">
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2">Solid Color</p>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {PRESET_COLORS.map(c => (
                      <button key={c} onClick={() => setBackground(c)}
                        className={cn('w-6 h-6 rounded border-2 transition-all hover:scale-110', bgColor === c ? 'border-accent scale-110' : 'border-border/40')}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-[10px] text-muted-foreground">Custom</Label>
                    <input type="color" value={bgColor.startsWith('#') ? bgColor : '#3b82f6'}
                      onChange={e => setBackground(e.target.value)}
                      className="h-6 w-14 p-0.5 rounded border border-border bg-input cursor-pointer" />
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2">Gradients</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {GRADIENTS.map(g => (
                      <button key={g.label} onClick={() => setBackgroundGradient(g.stops)}
                        className="h-12 rounded border border-border/50 hover:border-accent/50 transition-all hover:scale-105 text-[10px] font-semibold text-white/90 flex items-end p-1.5 overflow-hidden"
                        style={{ background: `linear-gradient(135deg, ${g.stops[0]}, ${g.stops[1]})` }}>
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* ─ TEMPLATES ─ */}
              <TabsContent value="templates" className="mt-0 p-3 space-y-2">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2">Starter Templates</p>
                <div className="space-y-1.5">
                  {TEMPLATES.map(t => (
                    <button key={t.id} onClick={() => applyTemplate(t.id)} disabled={!ready}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded border border-border bg-background hover:bg-accent/5 hover:border-accent/30 transition-colors disabled:opacity-40 group">
                      <div className="w-10 h-10 rounded flex-shrink-0 border-2" style={{ background: t.preview, borderColor: t.accent }} />
                      <span className="text-xs text-foreground text-left leading-tight">{t.label}</span>
                    </button>
                  ))}
                </div>
              </TabsContent>

              {/* ─ AI ─ */}
              <TabsContent value="ai" className="mt-0 p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-sm bg-accent/15 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <p className="text-xs font-medium text-foreground">AI Image Generator</p>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Describe what you want and AI will generate it directly onto your canvas.
                </p>
                <textarea
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder="A bold product photo with dramatic lighting and a dark studio background…"
                  className="w-full h-[90px] text-xs bg-input border border-border rounded p-2 resize-none placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent"
                  onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) generateAI() }}
                />
                <Button size="sm" className="w-full gap-2 text-xs" onClick={generateAI}
                  disabled={!aiPrompt.trim() || aiGenerating || !ready}>
                  {aiGenerating
                    ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating…</>
                    : <><Sparkles className="w-3.5 h-3.5" /> Generate Image</>}
                </Button>
                <p className="text-[10px] text-muted-foreground/60">Ctrl + Enter to generate</p>
              </TabsContent>
            </Tabs>
          </div>

          {/* ── CANVAS ──────────────────────────────────────────────────── */}
          <div
            ref={containerRef}
            className="flex-1 overflow-auto flex items-center justify-center relative bg-muted/20"
            style={showGrid ? {
              backgroundImage: 'linear-gradient(rgba(100,100,100,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(100,100,100,0.12) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            } : {}}
          >
            {!ready && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
                <RefreshCw className="w-5 h-5 text-muted-foreground/30 animate-spin" />
                <p className="text-xs text-muted-foreground/50 animate-pulse">Loading design tool…</p>
              </div>
            )}
            <canvas ref={canvasRef} className="shadow-[0_8px_40px_rgba(0,0,0,0.16)] rounded-sm" />
          </div>

          {/* ── RIGHT PANEL (Properties) ─────────────────────────────────── */}
          <div className="w-56 flex-shrink-0 border-l border-border bg-card overflow-y-auto">
            {!sel ? (
              /* ── Canvas info ── */
              <div className="p-4 space-y-5">
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-3">Canvas</p>
                  <div className="space-y-1.5 text-xs">
                    {([
                      ['Size',     `${selectedSize.w} × ${selectedSize.h}`],
                      ['Platform', selectedSize.group],
                      ['Zoom',     `${Math.round(zoom * 100)}%`],
                    ] as const).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-muted-foreground">{k}</span>
                        <span className="text-foreground">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-3">Shortcuts</p>
                  <div className="space-y-1.5">
                    {([
                      ['Ctrl+Z',   'Undo'],
                      ['Ctrl+Y',   'Redo'],
                      ['Ctrl+D',   'Duplicate'],
                      ['Delete',   'Delete object'],
                      ['Ctrl+↑',   'Bring forward'],
                      ['Ctrl+↓',   'Send backward'],
                      ['Dbl-click','Edit text'],
                    ] as const).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">{label}</span>
                        <code className="text-[9px] bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground">{key}</code>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Layers list (global) */}
                {layerList.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Layers className="w-3 h-3 text-muted-foreground" />
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Layers</p>
                      </div>
                      <div className="space-y-0.5 max-h-40 overflow-y-auto">
                        {layerList.map((layer, i) => (
                          <div key={i} className="px-2 py-1 rounded text-[10px] text-muted-foreground bg-muted/30 truncate">
                            {layer.type}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* ── Object properties ── */
              <div className="p-3 space-y-4">

                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{sel.type}</span>
                  <div className="flex gap-0.5">
                    <Tooltip><TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={toggleLock}>
                        {sel.locked
                          ? <Lock className="w-3 h-3 text-accent" />
                          : <Unlock className="w-3 h-3 text-muted-foreground" />}
                      </Button>
                    </TooltipTrigger><TooltipContent>{sel.locked ? 'Unlock' : 'Lock'}</TooltipContent></Tooltip>

                    <Tooltip><TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={duplicateSelected}>
                        <Copy className="w-3 h-3 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger><TooltipContent>Duplicate (Ctrl+D)</TooltipContent></Tooltip>

                    <Tooltip><TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:text-destructive" onClick={deleteSelected}>
                        <Trash2 className="w-3 h-3 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger><TooltipContent>Delete</TooltipContent></Tooltip>
                  </div>
                </div>

                {/* Position */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">Position</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <Label className="text-[9px] text-muted-foreground">X</Label>
                      <Input type="number" value={sel.x}
                        onChange={e => updateProp('left', Number(e.target.value) * zoom)}
                        className="h-6 text-xs bg-input border-border mt-0.5 px-1.5" />
                    </div>
                    <div>
                      <Label className="text-[9px] text-muted-foreground">Y</Label>
                      <Input type="number" value={sel.y}
                        onChange={e => updateProp('top', Number(e.target.value) * zoom)}
                        className="h-6 text-xs bg-input border-border mt-0.5 px-1.5" />
                    </div>
                  </div>
                </div>

                {/* Rotation */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Rotation</p>
                    <span className="text-[10px] text-muted-foreground tabular-nums">{sel.angle}°</span>
                  </div>
                  <Slider value={[sel.angle]} min={-180} max={180} step={1}
                    onValueChange={([v]) => updateProp('angle', v)} />
                </div>

                {/* Opacity */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Opacity</p>
                    <span className="text-[10px] text-muted-foreground tabular-nums">{sel.opacity}%</span>
                  </div>
                  <Slider value={[sel.opacity]} min={0} max={100} step={1}
                    onValueChange={([v]) => updateProp('opacity', v / 100)} />
                </div>

                <Separator />

                {/* Fill */}
                {sel.type !== 'line' && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">Fill</p>
                    <div className="flex items-start gap-2">
                      <input type="color"
                        value={typeof sel.fill === 'string' && sel.fill.startsWith('#') ? sel.fill : '#3b82f6'}
                        onChange={e => updateProp('fill', e.target.value)}
                        className="h-7 w-10 p-0.5 rounded border border-border bg-input cursor-pointer flex-shrink-0 mt-0.5" />
                      <div className="grid grid-cols-6 gap-0.5 flex-1">
                        {PRESET_COLORS.slice(0, 18).map(c => (
                          <button key={c} onClick={() => updateProp('fill', c)}
                            className={cn('w-5 h-5 rounded border transition-all hover:scale-110', sel.fill === c ? 'border-accent scale-105' : 'border-border/30')}
                            style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Stroke */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">Stroke</p>
                  <div className="flex items-center gap-2">
                    <input type="color"
                      value={!sel.stroke || sel.stroke === 'transparent' ? '#000000' : sel.stroke}
                      onChange={e => updateProp('stroke', e.target.value)}
                      className="h-7 w-10 p-0.5 rounded border border-border bg-input cursor-pointer flex-shrink-0" />
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <Label className="text-[9px] text-muted-foreground shrink-0">W</Label>
                      <Input type="number" min={0} max={40} value={sel.strokeWidth}
                        onChange={e => updateProp('strokeWidth', Number(e.target.value))}
                        className="h-7 text-xs bg-input border-border flex-1 px-1.5" />
                    </div>
                  </div>
                </div>

                {/* ── TEXT PROPERTIES ── */}
                {isText && (
                  <>
                    <Separator />
                    {/* Font family + size */}
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">Font</p>
                      <select value={sel.fontFamily}
                        onChange={e => updateProp('fontFamily', e.target.value)}
                        className="w-full h-7 text-xs bg-input border border-border rounded px-1.5 text-foreground mb-1.5 focus:outline-none focus:ring-1 focus:ring-accent">
                        {FONTS.map(f => (
                          <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1.5">
                        <Input type="number" min={6} max={400} value={Math.round(sel.fontSize)}
                          onChange={e => updateProp('fontSize', Number(e.target.value) * zoom)}
                          className="h-7 text-xs bg-input border-border w-14 px-1.5 flex-shrink-0" />
                        {/* Bold / Italic / Underline */}
                        <div className="flex gap-0.5 flex-1">
                          {([
                            { icon: Bold,          prop: 'fontWeight',  active: sel.fontWeight === 'bold',   on: 'bold',  off: 'normal' },
                            { icon: Italic,        prop: 'fontStyle',   active: sel.fontStyle === 'italic',  on: 'italic', off: 'normal' },
                            { icon: UnderlineIcon, prop: 'underline',   active: sel.underline,               on: true,    off: false },
                          ]).map(({ icon: Icon, prop, active, on: onVal, off: offVal }) => (
                            <Button key={prop} variant={active ? 'secondary' : 'ghost'}
                              size="sm" className="h-7 flex-1 p-0"
                              onClick={() => updateProp(prop, active ? offVal : onVal)}>
                              <Icon className="w-3 h-3" />
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Text alignment */}
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">Alignment</p>
                      <div className="flex gap-0.5">
                        {([
                          { v: 'left',    Icon: AlignLeft },
                          { v: 'center',  Icon: AlignCenter },
                          { v: 'right',   Icon: AlignRight },
                          { v: 'justify', Icon: AlignJustify },
                        ] as const).map(({ v, Icon }) => (
                          <Button key={v} variant={sel.textAlign === v ? 'secondary' : 'ghost'}
                            size="sm" className="flex-1 h-7 p-0" onClick={() => updateProp('textAlign', v)}>
                            <Icon className="w-3 h-3" />
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Letter spacing + line height */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <Label className="text-[9px] text-muted-foreground">Spacing</Label>
                        <Input type="number" step={10} min={-200} max={800} value={sel.charSpacing}
                          onChange={e => updateProp('charSpacing', Number(e.target.value))}
                          className="h-6 text-xs bg-input border-border mt-0.5 px-1.5" />
                      </div>
                      <div>
                        <Label className="text-[9px] text-muted-foreground">Line ht.</Label>
                        <Input type="number" step={0.1} min={0.5} max={4} value={sel.lineHeight}
                          onChange={e => updateProp('lineHeight', Number(e.target.value))}
                          className="h-6 text-xs bg-input border-border mt-0.5 px-1.5" />
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Layer order */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">Layer Order</p>
                  <div className="grid grid-cols-4 gap-0.5">
                    {([
                      { action: bringFront,   Icon: ChevronsUp,  tip: 'Bring to Front' },
                      { action: bringForward, Icon: ChevronUp,    tip: 'Bring Forward (Ctrl+↑)' },
                      { action: sendBackward, Icon: ChevronDown,  tip: 'Send Backward (Ctrl+↓)' },
                      { action: sendBack,     Icon: ChevronsDown, tip: 'Send to Back' },
                    ]).map(({ action, Icon, tip }) => (
                      <Tooltip key={tip}><TooltipTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 p-0 border-border" onClick={action}>
                          <Icon className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger><TooltipContent>{tip}</TooltipContent></Tooltip>
                    ))}
                  </div>
                </div>

                {/* Live layers list */}
                {layerList.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Layers className="w-3 h-3 text-muted-foreground" />
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">All Layers</p>
                    </div>
                    <div className="space-y-0.5 max-h-28 overflow-y-auto">
                      {layerList.map((layer, i) => (
                        <div key={i} className="px-2 py-0.5 rounded text-[10px] text-muted-foreground bg-muted/30 truncate">
                          {layer.type}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
