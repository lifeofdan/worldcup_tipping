<template>
  <q-layout @scroll="onScroll" view="lHr LpR lFr">

    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="layoutStore.toggleLeftDrawer"
          v-if="layoutStore.isLeftDrawerEnabled" />

        <q-toolbar-title>
          <q-avatar>
            <ProfileImage></ProfileImage>
          </q-avatar>
          {{ layoutStore.title }}
        </q-toolbar-title>

        <q-btn dense flat round icon="menu" @click="layoutStore.toggleRighDrawer"
          v-if="layoutStore.isRightDrawerEnabled" />
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="layoutStore.leftDrawer" side="left" bordered>
      <!-- drawer content -->
    </q-drawer>

    <q-drawer v-model="layoutStore.rightDrawer" side="right" bordered>
      <MainMenu></MainMenu>
    </q-drawer>

    <q-page-container>
      <router-view />
      <q-page-scroller v-if="show" expand position="top" :scroll-offset="150" :offset="[0, 0]">
        <ScrollUpMessage></ScrollUpMessage>
      </q-page-scroller>
    </q-page-container>

  </q-layout>
</template>

<script lang="ts">
import { useMenuStore } from 'src/stores/menu-store'
import { useUserStore } from 'src/stores/user-store'
import { defineComponent, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useLayoutStore } from '../stores/layout-store'
import ProfileImage from '../components/user/ProfileImage.vue'
import MainMenu from '../components/general/MainMenu.vue'
import ScrollUpMessage from '../components/general/ScrollUpMessage.vue'

export default defineComponent({
  name: 'PlaneLayout',
  components: { ProfileImage, MainMenu, ScrollUpMessage },
  setup () {
    const router = useRouter()
    const route = useRoute()
    const userStore = useUserStore()
    const menuStore = useMenuStore()
    const layoutStore = useLayoutStore()
    const show = ref(true)

    if (!userStore.isLogin) {
      router.push({ name: 'home' })
    } else {
      userStore.setupSocket()
    }

    watch(
      () => route.fullPath,
      () => {
        show.value = false
      }
    )

    const onScroll = () => {
      show.value = true
    }

    return {
      layoutStore,
      menuStore,
      userStore,
      show,
      onScroll
    }
  }
})
</script>
