<div>

  <div class="menu vertical-rl inline-block text-center"> 
    <div class="header"> menu </div>
    <span class="choice">
      <a href="../front"> front </a> &nbsp; &nbsp;
      <a href="../home"> home </a> &nbsp; &nbsp;
      <a href="../map"> embedding </a> &nbsp; &nbsp;
      <a href="../graph"> graph </a> &nbsp; &nbsp;
    </span>
  </div>


  <section class="flex-column">
    <section class="pad-top"></section>
    <section class="holder">
      <div class="absolute scroll h-100" style="width:20vw; overflow-x: hidden;">
        <div class="word relative" v-for="w in word">
          <a class="no-dec" v-bind:href="`../graph/?#!/?words[]=${w.word}`" target="__blank">
            <div class="w-prop">{{ (w.prop * 100).toFixed(2) + '%' }}</div>
            <div class="lightblue w-bar" v-bind:style="{ width: w.width * 100 + '%'}">
              <div class="w-text">{{ w.word }}</div>
            </div>
          </a>
        </div>
      </div>

      <section class="absolute scroll h-100" style="right:7vw; width:63vw">
        <div class="flex-column" style="height:inherit">
          <div class="chart"><div id="chart"></div><br></div>
          <div class="docs relative">

            <div class="absolute scroll h-100 w-100">

              <table>

                <tr class="doc relative">
                  <th class="d-date text-center"> date </th>
                  <th class="d-name text-left"> name </th>
                  <th class="d-token text-center"> # tokens </th>
                  <th class="d-count text-left">
                    <div class="d-bar" style="width: 100%">
                    <div class="d-bar" style="width: 0%">
                      <div class="d-text"> # topic tokens </div>
                    </div>
                    </div>
                  </th>
                </tr>

                <tr class="doc relative" v-for="d in doc">
                  <td class="d-date text-center"> {{ d.date }} </td>
                  <td class="d-name"> {{ d.name }} </td>
                  <td class="d-token text-center"> {{ d.token }} </td>
                  <td class="d-count text-left"> 
                    <div class="lightgray d-bar" style="width: 100%">
                    <div class="lightblue d-bar" v-bind:style="{ width: d.count / d.token * 100 + '%' }">
                      <div class="d-text">{{ d.count }}</div>
                    </div>
                    </div>
                  </td>
                </tr>
              </table>
            </div>

          </div>
        </div>
      </section>
    </section>


    <section class="footer">
      <!--div class="prop-bar" v-bind:style="{ width: 100*width + '%'}">
        <div class="prop-text">
          makes up {{ (prop * 100).toFixed(2) }}% of the corpus
        </div>
      </div-->
      <div 
        v-for="i in id"
        class="id-item"
        @click="app.remove(i)"> {{i}} </div>
    </section>
  </section>


  <div class="fixed pos-left top p-3" style="width: 90%">
    <a class="no-dec title" href="../home">The British Hansard</a>

    <input
      type="text"
      id="search_z"
      autocomplete="off"
      class="search_z"
      placeholder="set z"
      v-model="inp_z"
      @keyup.enter="app.set_z()">

    <input
      type="text"
      id="search_id"
      autocomplete="off"
      class="search_id"
      placeholder="add topic"
      v-model="inp_id"
      @keyup.enter="app.add_id()">

    <!--<div class="fixed pos-right top p-2">
    <a class='button no-dec pointer text-center'
       target="__blank"
       v-bind:href='`../graph/#!/?` + word
        .slice(0, 6)
        .map(w=>`words[]=`+w.word)
        .join("&")'>
      word graph for #{{ id }}
    </a>
  </div>-->

  </div>
</div>