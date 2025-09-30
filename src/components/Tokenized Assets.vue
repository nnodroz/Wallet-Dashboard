<template>
    <el-card class="Token-card">
    <template #header>
      <div class="card-header">
        <span>Tokenized Assets(ERC-20)</span>
      </div>
    </template>

    <el-row :gutter="16" style="">
      <el-col :span="8" v-for="token in tokenList" :key="token.symbol">
        <el-card class="token-item" shadow="hover">
          <div class="token-top">
            <img v-if="token.icon" :src="token.icon" :alt="token.symbol" style="width:32px; height:32px;">
            <div>
                <div style="font-weight: 600;">{{ token.name }}</div>
                <div style="color: #909399; font-size: 12px;">{{ token.symbol }}</div>
            </div>
          </div>
          <el-statistic
            :value="token.formatted"
            :precision="2"
            :prefix="token.symbol"
            value-style="color: #67C23A; font-size: 18px;"
          />
        </el-card>
      </el-col>
    </el-row>  
    
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWallet } from '../composable/useWallet'

const { tokens } = useWallet()


const tokenList = computed(() => tokens.value)
</script>

<style scoped>
.Token-card { width: 100%; }
.token-item { padding: 12px; }
.card-header { font-size: 16px; font-weight: 600; }

.token-top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}
</style>
