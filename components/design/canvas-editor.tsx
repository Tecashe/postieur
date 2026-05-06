'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Square, Circle, Type, Image as ImageIcon, Download, Trash2,
  Undo2, Redo2, AlignLeft, AlignCenter, AlignRight, Bold, Italic,
  Minus, Plus, Palette, Sparkles, RefreshCw,
} from 'lucide-react'

type FabricModule = typeof import('fabric')
type FabricCanvas = InstanceType<FabricModule['Canvas']>

const CANVAS_SIZES = [
  { label: 'Square 1:1', w: 1080, h: 1080 },
  { label: 'Portrait 4:5', w: 1080, h: 1350 },
  { label: 'Story 9:16', w: 1080, h: 1920 },
  { label: 'Landscape 16:9', w: 1920, h: 1080 },
  { label: 'Twitter Banner', w: 1500, h: 500 },
]

const COLORS = ['#ffffff', '#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6']

export default function CanvasEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<FabricCanvas | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [selectedSize, setSelectedSize] = useState(CANVAS_SIZES[0])
  const [fillColor, setFillColor] = useState('#3b82f6')
  const [strokeColor, setStrokeColor] = useState('#000000')
  const [textValue, setTextValue] = useState('Your text here')
  const [zoom, setZoom] = useState(0.5)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)

  // Calculate scale to fit the container
  const getScale = useCallback(() => {
    if (!containerRef.current) return 0.5
    const containerW = containerRef.current.clientWidth - 32
    return Math.min(containerW / selectedSize.w, 600 / selectedSize.h, 1)
  }, [selectedSize])

  useEffect(() => {
    let canvas: FabricCanvas | null = null

    import('fabric').then(({ Canvas, Rect }) => {
      if (!canvasRef.current) return
      const scale = getScale()
      setZoom(scale)

      canvas = new Canvas(canvasRef.current, {
        width: selectedSize.w * scale,
        height: selectedSize.h * scale,
        backgroundColor: '#ffffff',
        selection: true,
      })
      fabricRef.current = canvas

      // Background rect
      const bg = new Rect({
        left: 0, top: 0,
        width: selectedSize.w * scale,
        height: selectedSize.h * scale,
        fill: '#f8f4ef',
        selectable: false,
        evented: false,
        name: 'background',
      })
      canvas.add(bg)
      canvas.renderAll()
      setReady(true)
    })

    return () => {
      canvas?.dispose()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSize])

  const addRect = async () => {
    const { Rect } = await import('fabric')
    const canvas = fabricRef.current
    if (!canvas) return
    const scale = zoom
    const rect = new Rect({
      left: 50 * scale, top: 50 * scale,
      width: 200 * scale, height: 120 * scale,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth: 2 * scale,
    })
    canvas.add(rect)
    canvas.setActiveObject(rect)
    canvas.renderAll()
  }

  const addCircle = async () => {
    const { Circle } = await import('fabric')
    const canvas = fabricRef.current
    if (!canvas) return
    const scale = zoom
    const circle = new Circle({
      left: 80 * scale, top: 80 * scale,
      radius: 60 * scale,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth: 2 * scale,
    })
    canvas.add(circle)
    canvas.setActiveObject(circle)
    canvas.renderAll()
  }

  const addText = async () => {
    const { IText } = await import('fabric')
    const canvas = fabricRef.current
    if (!canvas) return
    const scale = zoom
    const text = new IText(textValue || 'Double-click to edit', {
      left: 100 * scale, top: 100 * scale,
      fontSize: 32 * scale,
      fill: fillColor,
      fontFamily: 'Inter, sans-serif',
    })
    canvas.add(text)
    canvas.setActiveObject(text)
    canvas.renderAll()
  }

  const addImage = async () => {
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
      const scale = zoom
      img.scaleToWidth(300 * scale)
      img.set({ left: 50 * scale, top: 50 * scale })
      canvas.add(img)
      canvas.setActiveObject(img)
      canvas.renderAll()
    }
    input.click()
  }

  const deleteSelected = () => {
    const canvas = fabricRef.current
    if (!canvas) return
    const active = canvas.getActiveObject()
    if (active && (active as { name?: string }).name !== 'background') {
      canvas.remove(active)
      canvas.renderAll()
    }
  }

  const exportPNG = () => {
    const canvas = fabricRef.current
    if (!canvas) return
    const dataURL = canvas.toDataURL({ format: 'png', multiplier: 1 / zoom })
    const a = document.createElement('a')
    a.href = dataURL
    a.download = 'design.png'
    a.click()
  }

  const generateAIImage = async () => {
    if (!aiPrompt.trim() || aiGenerating) return
    setAiGenerating(true)
    try {
      const res = await fetch('/api/ai/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'image', content: aiPrompt.trim(), imagePrompt: aiPrompt.trim() }),
      })
      const data = await res.json() as { url?: string; error?: string }
      if (!data.url) throw new Error(data.error ?? 'No image URL returned')
      const { FabricImage } = await import('fabric')
      const canvas = fabricRef.current
      if (!canvas) return
      const img = await FabricImage.fromURL(data.url, { crossOrigin: 'anonymous' })
      const scale = zoom
      // Scale image to fill 80% of canvas width
      const targetW = selectedSize.w * scale * 0.8
      img.scaleToWidth(targetW)
      img.set({ left: selectedSize.w * scale * 0.1, top: selectedSize.h * scale * 0.1 })
      canvas.add(img)
      canvas.setActiveObject(img)
      canvas.renderAll()
      setAiPrompt('')
    } catch (err) {
      console.error('AI image generation failed:', err)
    } finally {
      setAiGenerating(false)
    }
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-7rem)]">
      {/* Toolbar */}
      <div className="w-48 flex-shrink-0 space-y-3">
        {/* Canvas Size */}
        <div className="space-y-1">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Canvas Size</p>
          {CANVAS_SIZES.map(s => (
            <button
              key={s.label}
              onClick={() => setSelectedSize(s)}
              className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${selectedSize.label === s.label ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
            >
              {s.label}
              <span className="block text-[10px] opacity-60">{s.w}×{s.h}</span>
            </button>
          ))}
        </div>

        <Separator />

        {/* Shapes */}
        <div className="space-y-1">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Add Element</p>
          <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-8" onClick={addRect} disabled={!ready}>
            <Square className="w-3.5 h-3.5" /> Rectangle
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-8" onClick={addCircle} disabled={!ready}>
            <Circle className="w-3.5 h-3.5" /> Circle
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-8" onClick={addText} disabled={!ready}>
            <Type className="w-3.5 h-3.5" /> Text
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-8" onClick={addImage} disabled={!ready}>
            <ImageIcon className="w-3.5 h-3.5" /> Image
          </Button>
        </div>

        <Separator />

        {/* Colors */}
        <div className="space-y-1">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Fill Color</p>
          <div className="grid grid-cols-5 gap-1">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setFillColor(c)}
                className={`w-7 h-7 rounded border-2 transition-all ${fillColor === c ? 'border-primary scale-110' : 'border-border'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <Input
            type="color"
            value={fillColor}
            onChange={e => setFillColor(e.target.value)}
            className="h-7 w-full p-0.5 cursor-pointer"
          />
        </div>

        {/* Text Input */}
        <div className="space-y-1">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Text Content</p>
          <Input
            value={textValue}
            onChange={e => setTextValue(e.target.value)}
            className="h-7 text-xs"
            placeholder="Text to add…"
          />
        </div>

        <Separator />

        {/* AI Image Generation */}
        <div className="space-y-1">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Generate with AI
          </p>
          <Input
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            className="h-7 text-xs"
            placeholder="Describe an image…"
            onKeyDown={e => { if (e.key === 'Enter') generateAIImage() }}
          />
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-2 text-xs h-8"
            onClick={generateAIImage}
            disabled={!aiPrompt.trim() || aiGenerating || !ready}
          >
            {aiGenerating
              ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating…</>
              : <><Sparkles className="w-3.5 h-3.5" /> Generate</>
            }
          </Button>
        </div>

        <Separator />

        {/* Actions */}
        <div className="space-y-1">
          <Button variant="destructive" size="sm" className="w-full gap-2 text-xs h-8" onClick={deleteSelected} disabled={!ready}>
            <Trash2 className="w-3.5 h-3.5" /> Delete Selected
          </Button>
          <Button size="sm" className="w-full gap-2 text-xs h-8" onClick={exportPNG} disabled={!ready}>
            <Download className="w-3.5 h-3.5" /> Export PNG
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div ref={containerRef} className="flex-1 bg-muted/30 rounded-xl border border-border flex items-center justify-center overflow-auto">
        {!ready && (
          <div className="text-sm text-muted-foreground animate-pulse">Loading canvas…</div>
        )}
        <canvas ref={canvasRef} className="shadow-2xl rounded" />
      </div>
    </div>
  )
}
