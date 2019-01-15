<div>

  <section class="body back">
      <svg
        class="absolute pos-left center-vertical"
        style="height:40vw; width:40vw; left:10vw">
        <a
          v-for="[name, f, x, y] in data"
          v-bind:xlink:href="'../topic/#!/'+name">
          <circle 
            v-bind:cx="3 + (x * 92) + '%'"
            v-bind:cy="3 + (y * 92) + '%'"
            v-bind:r='name == currname ? 9*f**0.33 : 5.5*f**0.33'
            class="pointer"
            v-bind:class="name == currname ? 'currimg' : ''"
            @mouseover="app.setimg(name);">
          </circle>
        </a>
      </svg>
    </section>

    <img 
      class="absolute center-vertical"
      style="height: 30vw; width: 30vw; right: 15vw" 
      v-bind:src="`../../../cloud/${currname}.png`">  
    </img>
  </section>

  <section>

    <div class="fixed pos-left p-3">
      <a class="no-dec" href="../home">The British Hansard</a>
    </div>
    <div class="fixed pos-right p-1 text-right">
      <div 
        v-for="(method, index) in keys"
        class="inline-block button text-center pointer"
        v-bind:class="index == curr ? 'ison' : ''"
        v-on:click="app.change(index)">
        {{ method }}
      </div>
    </div>
  </section>

  <div class="disclaimer">
    *the radius of each topic's circle is proportional to the cube root of its proportion in the corpus
  </div>

  <div class="menu vertical-rl inline-block text-center"> 
    <div class="header"> menu </div>
    <span class="choice">
      <a href="../front"> front </a> &nbsp; &nbsp;
      <a href="../home"> home </a> &nbsp; &nbsp;
      <a href="../map"> embedding </a> &nbsp; &nbsp;
      <a href="../graph"> graph </a> &nbsp; &nbsp;
    </span>
  </div>
</div>