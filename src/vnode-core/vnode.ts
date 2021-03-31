import { VNodeTS } from "./ts/options";

export function createVNode(
    tag:string,
    props:object|null,
    children:string|Array<VNodeTS>
):VNodeTS{
    return {
        el:null,
        tag,
        props:props||{},
        children
    }
}

export function setProps(
    name:string,
    value:string|Function,
    el:Element
):void{
    if(name.startsWith('on')){       //事件
        const eventName=name.replace('on','').toLowerCase();
        removeProps(name,value,el);
        el.addEventListener(eventName,value as EventListenerOrEventListenerObject);
    }else{
        el.setAttribute(name,value as string);
    }
}

export function removeProps(
    name:string,
    value:string|Function,
    el:Element
):void{
    if(name.startsWith('on')){       //事件
        el.removeEventListener(name.replace('on','').toLowerCase(),value as EventListenerOrEventListenerObject);
    }else{
        el.removeAttribute(name);
    }
}

export function mountElement(
    vnode:VNodeTS
):Element{
    const {tag,props,children}=vnode;
    const el=(vnode.el=document.createElement(tag));

    for(const [key,value] of Object.entries(props)){
        setProps(key,value,el);
    }

    if(typeof children==='string'){
        const childEl=document.createTextNode(children);
       el.appendChild(childEl);
    }else{
        children.forEach(vnode=>{
            const childEl=mountElement(vnode);
            el.appendChild(childEl);
        })
    }
    return el
}

export function mount(
    vnode:VNodeTS,
    el:string|Element
):(newVnode:VNodeTS)=>void|never{
    if(typeof el === 'string'){
       const container= document.querySelector(el);
       if(container==null){
            throw new Error(`需要挂载的节点容器不存在，请检查：${el}`);
       }
       el=container;
    }
    const subTree=mountElement(vnode);;
    el.appendChild(subTree);
    let oldVnode=vnode;
    return (newVnode)=>{
        diff(oldVnode,newVnode);
        oldVnode=newVnode;
    }
}

export function diff(
    oldVnode:VNodeTS,
    newVnode:VNodeTS
):void{
    const {tag:oldTag,props:oldProps,children:oldChildren}=oldVnode;
    const {tag:newTag,props:newProps,children:newChildren}=newVnode;

    const el=newVnode.el=oldVnode.el as Element;

    if(oldTag!==newTag){        //节点完全不一样，直接替换
        const newTree=mountElement(newVnode);
        el.replaceWith(newTree);
    }else{  // tag 相等需要对比 props 和 children
        for(const [newKey,newValue] of Object.entries(newProps)){
            if(!Reflect.has(oldProps,newKey)){      //没有新属性，需要添加
                setProps(newKey,newValue,el);
            }else{
                if(Reflect.get(oldProps,newKey)!==newValue){   //有新属性，我们需要看看value是否需要更改
                    setProps(newKey,newValue,el);
                }
            }
        }
        for(const [oldKey,oldValue] of Object.entries(oldProps)){
            if(!Reflect.has(newProps,oldKey)){
                removeProps(oldKey,oldValue,el);
            }
        }

        //  '1' vs  '2'

        if(typeof newChildren === 'string' && typeof oldChildren === 'string'){       
            el.innerHTML=newChildren;
        }


        //  '1' vs  [{tag: "div"}]

        if(typeof newChildren === 'string' && Array.isArray(oldChildren)){       
            // TODO
            //这里还需把之前的事件移除
            el.innerHTML=newChildren;
        }

        // [{tag: "div"}] vs '1'

        if(Array.isArray(newChildren) && typeof oldChildren === 'string'){
            el.innerHTML='';
            newChildren.forEach(vnode=>{
                const childEl=mountElement(vnode);
                el.appendChild(childEl);
            })
        }


        // [{tag: "div"}] vs [{tag: "p"}]

        if(Array.isArray(newChildren) && Array.isArray(oldChildren)){
            const diffMax=Math.min(newChildren.length,oldChildren.length);
            for(let i=0;i<diffMax;i++){
                diff(oldChildren[i],newChildren[i]);
            }
            if(newChildren.length>oldChildren.length){
                let diffChild=newChildren.slice(diffMax);
                diffChild.forEach(vnode=>{
                    el.appendChild(mountElement(vnode));
                })
            }else{
                //[{tag: "div"}] vs [{tag: "p"},{tag: "span"}]
                oldChildren.slice(newChildren.length).forEach(vnode=>{
                    el.removeChild(vnode.el as Element)
                })
            }
        }
    }
}