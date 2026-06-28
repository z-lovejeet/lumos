'use client'

import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface NumberCounterProps {
  value: number
  decimals?: number
  className?: string
  prefix?: string
  suffix?: string
}

export function NumberCounter({ value, decimals = 0, className, prefix = '', suffix = '' }: NumberCounterProps) {
  const [mounted, setMounted] = useState(false)
  const spring = useSpring(0, { bounce: 0, duration: 2000 })
  const display = useTransform(spring, (current) => {
    return prefix + current.toFixed(decimals) + suffix
  })

  useEffect(() => {
    setMounted(true)
    spring.set(value)
  }, [spring, value])

  if (!mounted) return <span className={className}>{prefix}{(0).toFixed(decimals)}{suffix}</span>

  return <motion.span className={className}>{display}</motion.span>
}
