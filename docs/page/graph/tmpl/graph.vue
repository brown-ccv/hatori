<div>

  <section 
    class="fixed"
    style="top: 10%; left: 5%; width: 60%">

    <section v-if="normalized" style="width: 100%; margin-top: 1%">
      <div class="inline-block" style="width: 70%">
        <li> keywords per 10,000 </li>
      </div>
      <button
        onclick="app.renormalize()"
        class="button inline-block pointer"
        style="width: 25%">
        as frequency
      </button>
    </section>
    <section v-else style="width: 100%; margin-top: 1%;">
      <div class="inline-block" style="width: 70%">
        <li> keywords count </li>
      </div>
      <button
        onclick="app.renormalize()"
        class="button inline-block pointer"
        style="width: 25%">
        as proportion
      </button>
    </section>
    
    <div>
      <div id="chart"></div>
    </div>
  </section>
  
  <section 
    class="fixed pos-right p-0"
    style="width: 25%; height: 100%; overflow: scroll;">

    <section class='collection'>
      <div 
        v-for="item in shown"
        class="button shown pointer"
        v-on:click="app.del(item.text)">
          {{ item.text }}
      </div>
    </section>
  </section>

  <section class="fixed">
    <div class="fixed pos-left p-3">
      <a class="no-dec" href="../home">The British Hansard</a>
    </div>
    <div class="white fixed pos-right p-1 text-right">
      <div>
        <input
          type="text"
          id="search"
          autocomplete="off"
          class="search"
          placeholder="search"
          v-model="search"
          @change="app.search()"
          @input="app.search()"
          @keypress="app.search()"
          @keyup.enter="app.add()">
        <br>
        <div class="fixed hits border">
          <div 
            v-for="item in hits"
            v-on:click="app.addword(item.text)"
            class="hit">
            {{ item.text }}
          </div>
        </div>
      </div>
    </div>
  </section>

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