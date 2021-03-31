import { h } from "../../src/vnode-core/h";
import { mount } from "../../src/vnode-core/vnode";

const vnode= h('div',{
    id:'firstBox',
    data_id:'1'
},[
    h('div',{},[
        h('p',{
            onclick:()=>{
                alert(333)
            }
        },'333'),
        h('span',{id:'box'},'000'),
    ])
]);

const vnode2= h('div',{
    class:'box'
},[
    h('div',{
        class:'er_div'
    },[
        h('p',{
            onclick:()=>{
                alert('二次更新')
            }
        },'这是二次更新后的数据'),
        h('input',{},'')
    ])
]);

const patch =mount(vnode,document.querySelector('#app'));


setTimeout(()=>{
    patch(vnode2);
    let count=0;
    setInterval(()=>{
        count++;
        patch(
            h('div',{
                class:'box'
            },[
                h('div',{
                    class:'er_div'
                },[
                    h('p',{
                        onclick:()=>{
                            alert(`${count}次更新`)
                        }
                    },`这是${count}次更新后的数据`),
                    h('input',{name:`name_${count}`},'')
                ])
            ])
        )

    },1000)
},3000)