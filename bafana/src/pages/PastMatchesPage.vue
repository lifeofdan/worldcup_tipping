<template>
  <q-page padding v-if="Object.keys(state).length && isReady">
    <transition appear enter-active-class="animated slideInLeft" leave-active-class="animated slideOutRight">
      <div class="row">
        <div class="col-md-4 col-xs-12" v-for="match in state" :key="match.id">
          <activeTipCard :match="match"></activeTipCard>
        </div>
      </div>
    </transition>
    <q-page-scroller expand position="top" :scroll-offset="150" :offset="[0, 0]">
      <ScrollUpMessage></ScrollUpMessage>
    </q-page-scroller>
  </q-page>
  <q-page  v-if="Object.keys(state).length === 0 && isReady" class="row items-evenly items-center flex-center">
      <div class="col-12" style="text-align:center">
        <span class="text-h6">No game has been played.</span>
      </div>
  </q-page>
</template>

<script lang="ts">
import { useLayoutStore } from 'src/stores/layout-store'
import { useMatchStore } from 'src/stores/match-store'
import { defineComponent } from 'vue'
import ActiveTipCard from '../components/match/ActiveTipCard.vue'
import ScrollUpMessage from 'src/components/general/ScrollUpMessage.vue'

export default defineComponent({
  name: 'PastMatchesPage',
  setup () {
    const matchStore = useMatchStore()
    const { isReady, state } = matchStore.fetchCompletedMatches()
    const layoutStore = useLayoutStore()

    layoutStore.activeLeftDrawer(false)
    layoutStore.setTitle('Past Matches')

    return {
      isReady,
      state
    }
  },
  components: { ActiveTipCard, ScrollUpMessage }
})
</script>
