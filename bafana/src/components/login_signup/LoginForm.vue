<template>
  <q-form @submit="onSignin" autofocus>
    <div class="row">
      <div class="col-xs-12 col-md-12 q-pl-lg q-pr-lg q-mb-md">
        <q-input v-model="username" label="Username" outlined @update:model-value="onInput"></q-input>
      </div>
      <div class="col-xs-12 col-md-12 q-pl-lg q-pr-lg q-mb-md">
        <q-input v-model="password" label="Password" outlined @update:model-value="onInput"
          :type="isPassword ? 'password' : 'text'">
          <template v-slot:append>
            <q-icon :name="isPassword? 'visibility_off' : 'visibility'" class="cursor-pointer"
              @click="isPassword= !isPassword" />
          </template>
        </q-input>
      </div>
      <div class="col-xs-6 q-pl-lg q-pr-lg q-mb-md">
        <q-btn label="Sign up" color="secondary" align="left" :to="{ name: 'signup'}"></q-btn>
      </div>
      <div class="col-xs-6 q-pl-lg q-pr-lg q-mb-md">
        <q-btn label="Sign in" color="primary" class="float-right" type="submit"></q-btn>
      </div>
      <div class="col-xs-12 q-pl-lg q-pr-lg q-mt-lg">
        <div class="text-caption">
          <q-btn flat dense label="Having issue logging in? Click here" no-caps :to="{ name: 'forgot-login' }"></q-btn>
        </div>
      </div>
    </div>
  </q-form>
</template>

<script lang="ts">
import { useUserStore } from 'src/stores/user-store'
import { defineComponent, ref, PropType } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'LoginForm',
  props: {
    modelValue: {
      type: Object as PropType<{ username: string, password: string }>
    }
  },
  emits: {
    'update:username': null,
    'update:password': null,
    'update:modelValue': null,
    signup: null,
    signin: null
  },
  setup (_, ctx) {
    const username = ref('')
    const password = ref('')
    const isPassword = ref(true)
    const userStore = useUserStore()
    const router = useRouter()
    const $q = useQuasar()

    const onInput = () => {
      ctx.emit('update:password', password.value)
      ctx.emit('update:username', username.value)
      ctx.emit('update:modelValue', {
        username: username.value,
        password: password.value
      })
    }

    const onSignin = () => {
      if (username.value && password.value) {
        (async () => {
          try {
            void await userStore.login(username.value, password.value)
            router.push({ name: 'scoreboard' })
          } catch (e) {
            $q.dialog({
              title: 'Authentication failed',
              message: 'Username or password incorrect'
            })
          }
        })()
      }
    }

    return {
      onInput,
      onSignin,
      username,
      password,
      isPassword
    }
  }
})
</script>
