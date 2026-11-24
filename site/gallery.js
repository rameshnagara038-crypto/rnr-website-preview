(()=>{
const get=id=>document.getElementById(id);
const toggle=document.querySelector('.manage-gallery'), panel=get('gallery-admin'), login=get('gallery-login'), upload=get('gallery-upload');
const status=get('gallery-status'), photos=get('gallery-photos'), more=get('gallery-more');
let authorization='',cursor=null;
toggle.onclick=()=>{panel.hidden=!panel.hidden;toggle.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden)panel.querySelector('form:not([hidden]) input').focus()};
function card({url,caption}){const f=document.createElement('figure'),im=new Image(),c=document.createElement('figcaption');im.loading='lazy';im.src=url;im.alt=caption||'RNR field photograph';c.textContent=caption;f.append(im,c);return f}
async function list(){more.disabled=true;try{const res=await fetch('/api/gallery'+(cursor?'?cursor='+encodeURIComponent(cursor):''));if(!res.ok)throw Error();const data=await res.json();for(const photo of data.images)photos.insertBefore(card(photo),photos.querySelector('.gallery-seed'));cursor=data.cursor;more.hidden=!cursor;get('gallery-load-status').textContent=''}catch{get('gallery-load-status').textContent='Could not load uploaded photos.';more.hidden=false;more.textContent='Retry loading photos'}finally{more.disabled=false}}
more.onclick=list;list();
login.onsubmit=async e=>{e.preventDefault();const btn=login.querySelector('button');btn.disabled=true;try{const value='Basic '+btoa(login.username.value+':'+login.password.value);const res=await fetch('/api/gallery/login',{method:'POST',headers:{Authorization:value}});if(!res.ok)throw Error(res.status===401?'Check your username and password.':'Please try again.');authorization=value;login.reset();login.hidden=true;upload.hidden=false;toggle.textContent='Manage gallery';status.textContent='Signed in. Choose a photo to upload.'}catch(err){status.textContent=err.message}finally{btn.disabled=false}};
get('gallery-logout').onclick=()=>{authorization='';upload.reset();upload.hidden=true;login.hidden=false;toggle.textContent='Gallery login';status.textContent='Signed out.'};
async function prepare(file){
 if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Select a JPEG, PNG or WebP photo.');
 if(file.size>25*1024*1024)throw Error('Select a photo smaller than 25 MB.');
 const img=await createImageBitmap(file);
 try{const scale=Math.min(1,2200/Math.max(img.width,img.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.86));if(!blob)throw Error('Could not process this photo.');return blob}finally{img.close()}
}
upload.onsubmit=async e=>{e.preventDefault();const btn=upload.querySelector('button');btn.disabled=true;get('gallery-logout').disabled=true;status.textContent='Uploading photo…';try{const data=await prepare(upload.photo.files[0]);const res=await fetch('/api/gallery?caption='+encodeURIComponent(upload.caption.value.trim()),{method:'POST',headers:{Authorization:authorization,'Content-Type':'image/jpeg'},body:data});const item=await res.json();if(!res.ok)throw Error(item.error||'Upload failed.');photos.prepend(card(item));upload.reset();status.textContent='Photo added to the gallery.'}catch(err){status.textContent=err.message||'Upload failed. Please try again.'}finally{btn.disabled=false;get('gallery-logout').disabled=false}};
})();
