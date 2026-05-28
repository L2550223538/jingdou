const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Update Select/Input Styling across the app for visual consistency
html = html.replace(/className="text-sm border rounded px-2 py-1"/g, 'className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"');
html = html.replace(/className="bg-transparent hover:bg-gray-100 rounded px-1 py-0.5 cursor-pointer focus:outline-none"/g, 'className="bg-transparent hover:bg-gray-100 border border-transparent hover:border-gray-300 rounded px-1 py-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"');
html = html.replace(/className="bg-transparent hover:bg-gray-100 rounded px-1 py-0.5 cursor-pointer focus:outline-none text-xs font-medium"/g, 'className="bg-transparent hover:bg-gray-100 border border-transparent hover:border-gray-300 rounded px-1 py-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-xs font-medium"');
html = html.replace(/className="bg-transparent hover:bg-gray-100 rounded px-1 py-0.5 cursor-pointer focus:outline-none text-xs"/g, 'className="bg-transparent hover:bg-gray-100 border border-transparent hover:border-gray-300 rounded px-1 py-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-xs"');

// Fix styling of the detail pane right side
html = html.replace(
  /<textarea name="content" required className="w-full border rounded-lg p-3 text-sm min-h-\[80px\]" placeholder="记录沟通细节\.\.\."><\/textarea>/g,
  '<textarea name="content" required className="w-full border border-gray-300 rounded-lg p-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" placeholder="记录沟通细节..."></textarea>'
);

// Fix styling of detail pane left side Info block
const oldInfo = `<div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-500"><span>官网</span><span className="text-blue-600">{customer.website || '-'}</span></div>
                  <div className="flex justify-between text-gray-500"><span>来源</span><span className="text-gray-800">{customer.source}</span></div>
                  <div>
                    <span className="text-gray-500 block mb-1">标签</span>
                    <div className="flex flex-wrap gap-1">{customer.tags?.map(t => <span key={t} className="text-xs bg-gray-100 px-2 py-1 rounded">{t}</span>) || '-'}</div>
                  </div>
                  <div>
                     <span className="text-gray-500 block mb-1">社媒</span>
                     {customer.socialMedia?.map((s,i)=><div key={i} className="text-gray-800 flex justify-between"><span className="text-xs bg-gray-100 px-1 rounded">{s.platform}</span> <span>{s.account}</span></div>)}
                  </div>
                </div>`;

const newInfo = `<div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center"><span className="text-gray-500">官网</span><span className="text-blue-600 hover:underline cursor-pointer truncate max-w-[150px]" title={customer.website}>{customer.website || '-'}</span></div>
                  <div className="flex justify-between items-center"><span className="text-gray-500">来源</span><span className="font-medium text-gray-800">{customer.source || '-'}</span></div>

                  <div className="pt-1">
                    <span className="text-gray-500 block mb-1.5">标签</span>
                    <div className="flex flex-wrap gap-1.5">{customer.tags?.length ? customer.tags.map(t => <span key={t} className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">{t}</span>) : <span className="text-gray-400">-</span>}</div>
                  </div>

                  <div className="pt-1">
                     <span className="text-gray-500 block mb-1.5">社媒</span>
                     <div className="space-y-1.5">
                       {customer.socialMedia?.length ? customer.socialMedia.map((s,i)=><div key={i} className="font-medium text-gray-800 flex justify-between items-center"><span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">{s.platform}</span> <span className="truncate max-w-[150px]" title={s.account}>{s.account}</span></div>) : <span className="text-gray-400">-</span>}
                     </div>
                  </div>
                </div>`;

html = html.replace(oldInfo, newInfo);

// Fix styling of the detail pane left side Contacts block
const oldContacts = `<div className="space-y-3">
                  {cContacts.map(c => (
                    <div key={c.id} className="p-3 bg-gray-50 rounded border text-sm">
                      <div className="flex justify-between items-start"><div className="font-bold mb-1">{c.name} {c.isPrimary && <span className="text-[10px] bg-green-100 text-green-700 px-1 rounded">首要</span>}</div><button onClick={() => { if(window.confirm('确定删除联系人?')) actions.deleteContact(c.id); }} className="text-gray-400 hover:text-red-600 p-0.5"><X className="w-3.5 h-3.5"/></button></div>
                      <div className="text-xs text-gray-500">{c.title}</div>
                      <div className="text-xs mt-1 text-gray-600">{c.email} {c.phone}</div>
                    </div>
                  ))}
                </div>`;

const newContacts = `<div className="space-y-3">
                  {cContacts.length === 0 ? <div className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-200 rounded-lg">暂无联系人</div> : cContacts.map(c => (
                    <div key={c.id} className="p-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg border border-gray-100 text-sm">
                      <div className="flex justify-between items-start mb-1.5">
                        <div className="font-bold text-gray-800 flex items-center gap-1.5">
                          {c.name}
                          {c.isPrimary && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium border border-green-200">首要</span>}
                        </div>
                        <button onClick={() => { if(window.confirm('确定删除联系人?')) actions.deleteContact(c.id); }} className="text-gray-400 hover:text-red-600 p-0.5 rounded hover:bg-red-50 transition-colors"><X className="w-3.5 h-3.5"/></button>
                      </div>
                      <div className="text-xs text-gray-500 mb-1">{c.title || '-'}</div>
                      <div className="text-xs text-gray-600 space-y-0.5">
                         <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-gray-400"/> {c.email || '-'}</div>
                         <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-gray-400"/> {c.phone || '-'}</div>
                      </div>
                    </div>
                  ))}
                </div>`;

html = html.replace(oldContacts, newContacts);

fs.writeFileSync('index.html', html);
