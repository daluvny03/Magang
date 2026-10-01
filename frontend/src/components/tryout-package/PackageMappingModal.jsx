import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, X } from 'lucide-react'

function PackageMappingModal({ isOpen, type, packageData, categories, questions, tiers, isSaving, onClose, onSave }) {
  const [selectedIds,setSelectedIds]=useState([])
  const [orderedQuestions,setOrderedQuestions]=useState([])
  const [search,setSearch]=useState('')

  useEffect(()=>{
    if(!isOpen||!packageData) return
    setSearch('')
    if(type==='categories') setSelectedIds((packageData.categories||[]).map(x=>String(x.id)))
    if(type==='tiers') setSelectedIds((packageData.subscriptionTiers||[]).map(x=>String(x.id)))
    if(type==='questions') setOrderedQuestions((packageData.questions||[]).map((x,index)=>({id:String(x.id), questionOrder:Number(x.questionOrder??index+1)})).sort((a,b)=>a.questionOrder-b.questionOrder))
  },[isOpen,type,packageData])

  const availableQuestions = useMemo(()=>questions.filter(q=>{
    const matchesSearch=!search.trim()||(q.questionText||'').toLowerCase().includes(search.trim().toLowerCase())
    return matchesSearch
  }),[questions,search])
  if(!isOpen) return null

  const toggle=(id)=>setSelectedIds(current=>current.includes(id)?current.filter(x=>x!==id):[...current,id])
  const toggleQuestion=(id)=>setOrderedQuestions(current=>current.some(x=>x.id===id)?current.filter(x=>x.id!==id):[...current,{id,questionOrder:current.length+1}])
  const move=(index,direction)=>setOrderedQuestions(current=>{const next=[...current], target=index+direction;if(target<0||target>=next.length)return current;[next[index],next[target]]=[next[target],next[index]];return next.map((x,i)=>({...x,questionOrder:i+1}))})
  const save=()=> type==='questions' ? onSave(orderedQuestions.map((x,i)=>({questionId:Number(x.id),questionOrder:i+1}))) : onSave(selectedIds.map(Number))
  const title={categories:'Manage Categories',questions:'Manage Questions',tiers:'Manage Subscription Tiers'}[type]

  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"><div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
    <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4"><div><h2 className="text-xl font-semibold text-gray-900">{title}</h2><p className="text-sm text-gray-500">{packageData?.name}</p></div><button type="button" disabled={isSaving} onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><X size={20}/></button></div>
    <div className="space-y-4 p-6">
      {type==='questions' && <><p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">Save category mapping first. Only active questions from the package categories should be assigned.</p><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search questions..." className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"/></>}
      {type==='categories' && <ChoiceList items={categories} selectedIds={selectedIds} toggle={toggle} label={x=>x.name}/>} 
      {type==='tiers' && <ChoiceList items={tiers} selectedIds={selectedIds} toggle={toggle} label={x=>`${x.name}${x.price!=null?` · ${x.price}`:''}`}/>} 
      {type==='questions' && <div className="grid gap-5 lg:grid-cols-2"><div><h3 className="mb-2 text-sm font-semibold text-gray-800">Available Questions</h3><div className="max-h-96 space-y-2 overflow-y-auto rounded-xl border p-3">{availableQuestions.map(q=>{const id=String(q.id),checked=orderedQuestions.some(x=>x.id===id);return <label key={q.id} className="flex cursor-pointer gap-3 rounded-lg p-2 hover:bg-gray-50"><input type="checkbox" checked={checked} onChange={()=>toggleQuestion(id)} className="mt-1"/><span className="text-sm text-gray-700">{q.questionText}</span></label>})}{availableQuestions.length===0&&<p className="p-3 text-sm text-gray-500">No matching questions.</p>}</div></div><div><h3 className="mb-2 text-sm font-semibold text-gray-800">Order ({orderedQuestions.length})</h3><div className="max-h-96 space-y-2 overflow-y-auto">{orderedQuestions.map((item,index)=>{const q=questions.find(x=>String(x.id)===item.id);return <div key={item.id} className="flex items-center gap-2 rounded-lg border p-3"><span className="w-6 text-sm font-semibold">{index+1}.</span><span className="min-w-0 flex-1 truncate text-sm text-gray-700">{q?.questionText||`Question #${item.id}`}</span><button type="button" onClick={()=>move(index,-1)} disabled={index===0} className="rounded p-1 hover:bg-gray-100 disabled:opacity-30"><ArrowUp size={16}/></button><button type="button" onClick={()=>move(index,1)} disabled={index===orderedQuestions.length-1} className="rounded p-1 hover:bg-gray-100 disabled:opacity-30"><ArrowDown size={16}/></button></div>})}</div></div></div>}
    </div>
    <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-white px-6 py-4"><button type="button" disabled={isSaving} onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium">Cancel</button><button type="button" disabled={isSaving} onClick={save} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">{isSaving?'Saving...':'Save Mapping'}</button></div>
  </div></div>
}
function ChoiceList({items,selectedIds,toggle,label}) { return <div className="grid gap-2 sm:grid-cols-2">{items.map(item=>{const id=String(item.id);return <label key={id} className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-gray-50"><input type="checkbox" checked={selectedIds.includes(id)} onChange={()=>toggle(id)}/><span className="text-sm text-gray-700">{label(item)}</span></label>})}{items.length===0&&<p className="text-sm text-gray-500">No options available.</p>}</div> }
export default PackageMappingModal
