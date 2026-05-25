import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { format, differenceInDays } from 'date-fns'
import { ArrowLeft, Edit2, Trash2, ArrowDownLeft, ArrowUpRight, Coffee, Star, ChevronRight, Archive, RotateCw } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Tooltip } from '@/components/ui/Tooltip'
import { FreshnessBadge } from '@/features/inventory/components/FreshnessBadge'
import { QuantityBar } from '@/features/inventory/components/QuantityBar'
import { TransactionList } from '@/features/inventory/components/TransactionList'
import { useCoffeeBeans } from '@/features/inventory/hooks/useCoffeeBeans'
import { useTransactions } from '@/features/inventory/hooks/useTransactions'
import { brewService } from '@/features/brew/services/brewService'
import type { BrewRecord } from '@/features/brew/types'
import { getRoastLevelLabel, parseBestPeriod, getFreshnessStatus, calculatePricePerGram } from '@/lib/utils'
import { coffeeBeanService } from '@/features/inventory/services/coffeeBeanService'

export function BeanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { beans, loading: beansLoading, deleteBean, refresh, archiveBean } = useCoffeeBeans()
  const { transactions, addTransaction } = useTransactions(id)
  const [brewRecords, setBrewRecords] = useState<BrewRecord[]>([])
  const [showTxModal, setShowTxModal] = useState(false)
  const [txType, setTxType] = useState<'add' | 'consume'>('consume')
  const [txAmount, setTxAmount] = useState(18)
  const [txNotes, setTxNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const bean = beans.find((b) => b.id === id)

  useEffect(() => {
    loadBrewRecords()
  }, [id])

  const loadBrewRecords = async () => {
    if (!id) return
    const all = await brewService.getAll()
    setBrewRecords(all.filter((r) => r.beanId === id))
  }

  if (beansLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-coffee-300 border-t-coffee-600 rounded-full animate-spin" />
          <p className="text-sm text-coffee-500">加载中...</p>
        </div>
      </div>
    )
  }

  if (!bean) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium text-coffee-700 mb-2">咖啡豆不存在</h2>
          <Link to="/" className="text-coffee-500 hover:text-coffee-700">
            返回列表
          </Link>
        </div>
      </div>
    )
  }

  const roastDate = new Date(bean.roastDate)
  const days = differenceInDays(new Date(), roastDate)
  const bestPeriod = parseBestPeriod(bean.notes)
  const freshness = getFreshnessStatus(roastDate, bestPeriod)

  const handleTransaction = async () => {
    if (txAmount <= 0) return
    if (txType === 'consume' && txAmount > bean.quantity) {
      alert(`库存不足！当前库存 ${bean.quantity}g，输入 ${txAmount}g`)
      return
    }
    try {
      setLoading(true)
      await addTransaction({
        type: txType,
        amount: txAmount,
        timestamp: new Date(),
        notes: txNotes,
      })

      const newQuantity = txType === 'add'
        ? bean.quantity + txAmount
        : bean.quantity - txAmount

      await coffeeBeanService.updateQuantity(bean.id, Math.max(0, newQuantity))
      await refresh()
      setShowTxModal(false)
      setTxAmount(18)
      setTxNotes('')
    } catch (error) {
      console.error('Failed to process transaction:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这款咖啡豆吗？')) return
    try {
      await deleteBean(bean.id)
      navigate('/')
    } catch (error) {
      console.error('Failed to delete bean:', error)
    }
  }

  const handleArchive = async () => {
    const action = bean.isArchived ? '取消归档' : '归档'
    if (!confirm(`确定要${action}这款咖啡豆吗？`)) return
    try {
      await archiveBean(bean.id, !bean.isArchived)
    } catch (error) {
      console.error('Failed to archive bean:', error)
    }
  }

  const formatBrewDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Shanghai',
    })
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-10 bg-cream-100/95 backdrop-blur-sm border-b border-coffee-300/60 shadow-[0_2px_8px_rgba(62,39,35,0.05)] px-5 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-coffee-700 hover:text-coffee-900">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">返回</span>
          </Link>
          <div className="flex items-center gap-2">
            <Tooltip content={bean.isArchived ? '取消归档' : '归档'}>
              <Button variant="ghost" size="sm" onClick={handleArchive}>
                {bean.isArchived ? (
                  <RotateCw className="w-4 h-4 text-green-600" />
                ) : (
                  <Archive className="w-4 h-4 text-coffee-600" />
                )}
              </Button>
            </Tooltip>
            <Tooltip content="编辑">
              <Link to={`/bean/${bean.id}/edit`}>
                <Button variant="ghost" size="sm">
                  <Edit2 className="w-4 h-4" />
                </Button>
              </Link>
            </Tooltip>
            <Tooltip content="删除">
              <Button variant="ghost" size="sm" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </Tooltip>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6 space-y-5">
        <Card className="p-6 animate-fade-in">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-coffee-900 tracking-tight">{bean.name}</h1>
              <p className="text-coffee-600 mt-1">
                {bean.origin || '未知产地'} · {bean.roaster || '未知烘焙商'}
                {bean.farm ? ` · ${bean.farm}` : ''}
              </p>
              {(bean.beanVariety || bean.processingMethod) && (
                <p className="text-coffee-500 mt-1 text-sm">
                  {bean.beanVariety}
                  {bean.beanVariety && bean.processingMethod ? ' · ' : ''}
                  {bean.processingMethod}
                </p>
              )}
            </div>
            <FreshnessBadge status={freshness} days={days} bestPeriod={bestPeriod} />
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-coffee-100 text-coffee-700">
              {getRoastLevelLabel(bean.roastLevel)}
            </span>
            <span className="text-sm text-coffee-500">
              烘焙日期：{format(roastDate, 'yyyy年M月d日')}
            </span>
          </div>
          <p className="text-xs text-coffee-500 mt-2 bg-cream-50 rounded-lg px-3 py-2">
            🌿 养豆期 {bestPeriod.restDays} 天 · 最佳饮用期 第 {bestPeriod.restDays}~{bestPeriod.bestDays} 天
          </p>
        </Card>

        <Card className="p-6 animate-fade-in stagger-1">
          <h2 className="text-lg font-semibold text-coffee-800 mb-4">库存状态</h2>
          <QuantityBar current={bean.quantity} total={bean.totalQuantity} />

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-coffee-100">
            <span className="text-sm text-coffee-600">单价</span>
            <span className="font-medium text-coffee-800">
              {calculatePricePerGram(bean.price, bean.totalQuantity)}
            </span>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => { setTxType('consume'); setShowTxModal(true) }}
            >
              <ArrowUpRight className="w-4 h-4 mr-2 text-orange-600" />
              出库
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => { setTxType('add'); setShowTxModal(true) }}
            >
              <ArrowDownLeft className="w-4 h-4 mr-2 text-green-600" />
              入库
            </Button>
          </div>
        </Card>

        {bean.notes && (
          <Card className="p-6 animate-fade-in stagger-2">
            <h2 className="text-lg font-semibold text-coffee-800 mb-3">详细信息</h2>
            <p className="text-coffee-600 leading-relaxed whitespace-pre-line">{bean.notes}</p>
          </Card>
        )}

        {brewRecords.length > 0 && (
          <Card className="p-6 animate-fade-in stagger-3">
            <h2 className="text-lg font-semibold text-coffee-800 mb-4 flex items-center gap-2">
              <Coffee className="w-5 h-5" />
              手冲记录
              <span className="text-sm font-normal text-coffee-400">({brewRecords.length}次)</span>
            </h2>
            <div className="space-y-2">
              {brewRecords.map((record) => (
                <button
                  key={record.id}
                  onClick={() => navigate(`/brew/${record.id}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-cream-50 border border-coffee-100 hover:border-coffee-300 hover:bg-cream-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < record.rating ? 'fill-accent-400 text-accent-400' : 'text-coffee-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-coffee-700 font-medium">
                        {record.beanWeight}g
                      </span>
                      {record.method && (
                        <span className="text-xs text-coffee-400">{record.method}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-coffee-400 flex-shrink-0">
                    {formatBrewDate(record.createdAt)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-coffee-300 flex-shrink-0" />
                </button>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-6 animate-fade-in stagger-3">
          <h2 className="text-lg font-semibold text-coffee-800 mb-4">操作记录</h2>
          <TransactionList transactions={transactions} />
        </Card>
      </main>

      <Modal
        isOpen={showTxModal}
        onClose={() => setShowTxModal(false)}
        title={txType === 'add' ? '入库' : '出库'}
        footer={
          <>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowTxModal(false)}
            >
              取消
            </Button>
            <Button
              className="flex-1"
              onClick={handleTransaction}
              disabled={loading || txAmount <= 0}
            >
              确认
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="数量 (g)"
            type="number"
            value={txAmount}
            onChange={(e) => setTxAmount(Number(e.target.value))}
            min={1}
          />
          <Input
            label="备注"
            value={txNotes}
            onChange={(e) => setTxNotes(e.target.value)}
            placeholder="可选"
          />
        </div>
      </Modal>
    </div>
  )
}