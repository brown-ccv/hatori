<div>
  <div class="title"> Hansard </div>
  <input 
    class="search" 
    placeholder="search" 
    v-model="query"
    @input="app.search(query)"
    @change="app.search(query)"/>

  <div class="menu vertical-rl inline-block text-center"> 
    <div class="header"> menu </div>
    <span class="choice">
      <a href="../front"> front </a> &nbsp; &nbsp;
      <a href="../home"> home </a> &nbsp; &nbsp;
      <a href="../map"> embedding </a> &nbsp; &nbsp;
      <a href="../graph"> graph </a> &nbsp; &nbsp;
    </span>
  </div>

  <div class="sort vertical-rl inline-block text-center"> 
    <div class="header"> menu </div>
    <span class="choice">
      <span onclick="app.sort('prop')"> proportion </span> &nbsp; &nbsp;
      <span onclick="app.sort('id')"> id </span> &nbsp; &nbsp;
      <span onclick="app.sort('mean')"> mean year </span> &nbsp; &nbsp;
    </span>
  </div>



  <div class="p-5"> </div>
  <div class="text-center container-fluid">
    <div class="row">
      <div 
        v-for="item in items" 
        class="col-12 col-sm-4 holder p-0"
        v-bind:style="{ 'display' : shown.has(item.id) ? 'initial' : 'none' } ">
          <div class="subholder">
          <a v-bind:href="`../topic/#!/${item.id}`">
            <img
              v-bind:data-src="`../../../cloud/${item.id}.png`"
              class="object-contain cloud lazyload">  
            </img>
            <div class="alttext text-center object-contain p-3"> 
              <div>{{ item.id }} </div>
              <img 
                class="trend m-3 lazyload"
                src="./data/graph/placeholder.png"
                v-bind:data-src="`../../../front/graph-${item.id}.png`">  
              </img>
              <br>
              <div style="relative">
                <div
                  class="inline-block p-0 text-left"
                  style="width:30%">
                  {{ Math.round(item.prop * 10000) / 100 }} %
                </div>
                <div
                  class="inline-block relative p-0 propbar"
                  style="width:50%;">
                  <div
                    class="block p-0 background-blue h-100 right" 
                    v-bind:style="{ width: item.width * 100 + '%'}">
                    &nbsp;
                  </div>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>

    </div>
  </div>


</div>