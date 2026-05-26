'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Tags, Plus, X, Check, Loader2, Info } from 'lucide-react'

interface Category {
  id: string
  name: string
  description?: string
  icon: string
  color: string
  is_default: boolean
}

export default function CategoriesPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  
  // Custom Add State
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [icon, setIcon] = useState('tag')
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true })

        if (error) throw error
        setCategories(data || [])
      } catch (err) {
        console.error('Failed to load categories:', err)
      } finally {
        setLoading(false)
      }
    }
    loadCategories()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name,
          description,
          color,
          icon,
          is_default: false
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          throw new Error('A category with this name already exists.')
        }
        throw error
      }

      setCategories([...categories, data].sort((a, b) => a.name.localeCompare(b.name)))
      setIsAddOpen(false)
      setName('')
      setDescription('')
      setColor('#6366f1')
      setIcon('tag')
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while creating category.')
    } finally {
      setFormLoading(false)
    }
  }

  const iconsList = ['home', 'zap', 'utensils', 'car', 'film', 'shopping-bag', 'heart-pulse', 'trending-up', 'briefcase', 'dollar-sign', 'gift', 'tag', 'book', 'plane', 'coffee']
  const colorsList = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6', '#06b6d4', '#22c55e', '#84cc16', '#a855f7', '#6366f1', '#64748b', '#f43f5e', '#d946ef']

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="text-slate-400 text-sm animate-pulse">Loading transaction tags...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gradient">Transaction Categories</h1>
          <p className="text-slate-400 text-sm mt-1">View predefined categories or register custom budgeting tags</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 self-start md:self-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 text-sm"
        >
          <Plus className="h-4 w-4" /> Create Category
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-300 text-xs flex gap-3 items-start max-w-2xl leading-normal">
        <Info className="h-4 w-4 flex-shrink-0 text-indigo-400 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Predefined System Categories</span>
          System-wide categories are seeded by default to help you immediately catalog Rent, Utilities, Food & Dining, Salaries, and general Shopping.
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div 
            key={cat.id} 
            className="glass-panel p-5 rounded-2xl bg-slate-900/40 border border-slate-950 flex flex-col justify-between min-h-36 relative overflow-hidden group"
          >
            {/* Colorful Glow */}
            <div 
              className="absolute top-0 right-0 w-16 h-16 rounded-full blur-xl opacity-10 group-hover:opacity-20 transition-opacity" 
              style={{ backgroundColor: cat.color }} 
            />

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Visual Icon Block */}
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md"
                  style={{ backgroundColor: cat.color + '20', color: cat.color }}
                >
                  <Tags className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 text-sm">{cat.name}</h3>
                  <span className="text-[10px] text-slate-500 mt-0.5 block font-medium">
                    {cat.is_default ? 'System seeded' : 'Custom tag'}
                  </span>
                </div>
              </div>
            </div>

            {cat.description && (
              <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                {cat.description}
              </p>
            )}

            <div className="mt-4 pt-3 border-t border-slate-900/50 flex justify-between items-center text-xxs font-bold uppercase tracking-wider text-slate-500">
              <span>HSL Color</span>
              <span className="font-mono text-slate-400" style={{ color: cat.color }}>
                {cat.color}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md bg-slate-950 p-6 rounded-2xl border border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-5">
              <h3 className="font-bold text-lg text-slate-200">Create Custom Category</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex gap-2 items-center">
                <Info className="h-4 w-4 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hobbies, Education, Subscriptions"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Description</label>
                <textarea
                  rows={2}
                  placeholder="Summarize the intent of this transaction label..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all resize-none"
                />
              </div>

              {/* Color picker grid */}
              <div className="space-y-2">
                <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Custom Palette Theme</label>
                <div className="grid grid-cols-5 gap-2.5">
                  {colorsList.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-8 rounded-lg transition-transform border border-slate-950 flex items-center justify-center text-white font-bold relative ${
                        color === c ? 'scale-105 border-indigo-400' : 'hover:scale-[1.03]'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end pt-3 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" /> Save Category
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
