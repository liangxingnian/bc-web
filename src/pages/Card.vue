<template>
  <div>
    <div class="flex">
      <div>
        <q-btn color="light-blue" unelevated @click.stop="drawer=true">
          <q-icon name="ti-credit-card" size="15px" style="margin-top: -2px"/>
          <span class="q-ml-sm">开卡</span>
        </q-btn>
      </div>
      <div class="flex q-ml-lg">
        <div class="q-ml-lg">
          <span>有效卡</span>
          <span class="number">{{ this.userCardsDetail.activateCount }}</span>
        </div>
        <div class="q-ml-lg">
          <span>已销卡</span>
          <span class="number">{{ this.userCardsDetail.maintainCount }}</span>
        </div>
      </div>
    </div>
    <div class="row q-col-gutter-lg q-mt-md">
      <div class="col-4" v-for="card2 in clientBankCardList" :key="card2.id">
        <w-card :data="card2" @click="cardClick"/>
      </div>
      <div class="col-4" v-for="card in bankCardList" :key="card.id">
        <w-card :data="card" @click="cardClickFalse" style="background-color: #777986"/>
      </div>
    </div>

    <div class="text-bold q-mt-lg" style="color: cornflowerblue;font-size: 30px">卡片列表</div>

    <div class="q-pa-sm bg-white q-mt-lg">
      <div class="row items-center q-mb-sm">
        <q-input :class="queryObj.size" outlined dense label="卡号或后四位" clearable
                 v-model="queryObj.number " style="min-width: 10em"
                 class="q-mr-sm q-mb-xs"/>
        <q-select outlined dense label="卡状态" clearable
                  v-model="queryObj.state" style="min-width: 10em"
                  :options="stateList" class="q-mr-sm q-mb-xs"
                  option-value="value" emit-value
                  option-label="label" map-options/>
        <q-input :class="queryObj.size" outlined dense label="备注" clearable
                 v-model="queryObj.remark " style="min-width: 10em"
                 class="q-mr-sm q-mb-xs"/>
        <div class="q-mb-xs q-mr-sm">
          <q-btn unelevated class="q-mr-sm" @click="query" label="查询" padding="6px 26px"
                 style="background-color: #6BAAFC; color: #FFFFFF"/>
          <q-btn unelevated class="q-mr-sm" @click="batchCancelCard" label="批量删卡" padding="6px 26px"
                 style="background-color: #EF4C4D; color: #FFFFFF"/>
        </div>
      </div>
      <w-table key-field="id" :list="list" :columns="columns" :has-header="false" list-type="purchaser"
               :selection="selected"
               @on-change="changeCheck" @on-change-all="changeAllCheck" ref="listTable">
        <template slot="number" slot-scope="row">
          {{ row.data.number ? row.data.number : '-' }}
        </template>
        <template slot="organization" slot-scope="row">
          {{ row.data.organization ? row.data.organization : '-' }}
        </template>
        <div class="flex content-center justify-center" slot="balance" slot-scope="row">
          {{ row.data.balance }}
          <q-icon v-if="row.data.state===1" name="ti-reload" class="flush" size="12px" style="color: #777986"
                  @click="getUserCardsBalance(row.data, true)"/>

        </div>
        <template slot="bin" slot-scope="row">
          <span v-html="row.data.bin"></span>
        </template>
        <template slot="expiryDate" slot-scope="row">
          {{ row.data.expiryDate ? row.data.expiryDate : '-' }}
        </template>
        <template slot="cvv" slot-scope="row">
          {{ row.data.cvv ? row.data.cvv : '-' }}
        </template>
        <template slot="remark" slot-scope="row">
          <q-btn flat color="black" @click="openRemark(row.data)">{{ row.data.remark ? row.data.remark : '-' }}
            <q-tooltip content-style="font-size: 14px" anchor="top right" self="top left">
              点击修改
            </q-tooltip>
          </q-btn>
        </template>
        <template slot="createTime" slot-scope="row">
          {{ row.data.createTime ? whc.Date.formatDateTime(new Date(row.data.createTime)) : '-' }}
        </template>

        <template slot="action" slot-scope="row">
          <q-btn flat @click.stop="rechargeClick(row.data)" v-show="row.data.state === 1"
                 style="background-color: #409EFF;color: white" class="q-mr-sm" size="12px">充值
          </q-btn>
          <q-btn flat @click.stop="detailClick2(row.data)" v-show="row.data.state === 1"
                 style="background-color: #409EFF;color: white" class="q-mr-sm" size="12px">详情
          </q-btn>
          <q-btn flat @click="cashOutClick(row.data)" v-show="row.data.state === 1"
                 style="background-color: #409EFF;color: white" class="q-mr-sm" size="12px">转出
          </q-btn>
          <q-btn flat @click="cancelClick(row.data)" v-show="row.data.state === 1"
                 style="background-color: #F56C6C;color: white" size="12px">销卡
          </q-btn>
        </template>

      </w-table>
      <w-empty :has="list.length" tip="没有找到相关的数据"/>
      <w-page v-if="list.length" ref="page" :current="queryObj.pageNumber" :total="total" @on-change="pageNumberChange"
              @on-page-size-change="pageSizeChange"/>
    </div>

    <!-- 侧面弹窗-->
    <q-drawer
      v-model="drawer"
      :width='1100'
      :breakpoint="500"
      overlay
      side="right"
      bordered
      @hide="select={}"
    >
      <q-scroll-area class="fit">
        <q-form @submit="openCard(select)" ref="openCardRefs">
          <div style="padding: 10px;border-bottom: 1px solid rgba(0,0,0,0.2)" class="text-right">
            <q-icon name="ti-close" @click="drawer=false" class="flush q-mr-lg"></q-icon>
          </div>
          <div class="q-px-md q-py-lg">
            <div style="border-bottom: 1px solid rgba(0,0,0,0.1)" class="q-pb-sm"><span
              class="q-ml-md">请选择卡头</span>
            </div>
          </div>

          <div class="flex q-ma-lg">
            <div v-for="card in clientBankCardList" :key="card.id">
              <div style="border: 1px solid rgba(0,0,0,0.1); border-radius: 5px" class="q-pa-md q-mr-md q-mb-md">
                <q-radio dense v-model="select" :val="card" :label="card.bin + ' ' + card.cr" @input="input(card)"/>
              </div>
            </div>
          </div>

          <div v-show="select.organization">
            <div class="flex no-wrap">
              <div style="width: 40%">
                <div class="q-pl-lg">
                  <div class="item">
                    <div class="title">状态</div>
                    <span
                      style="background-color: #26A69A;color: white;padding: 5px 10px;border-radius: 5px">正常</span>
                  </div>
                  <div class="item q-mt-lg">
                    <div class="title">币种</div>
                    <span>USD</span>
                  </div>
                  <div class="item q-mt-lg">
                    <div class="title">类型</div>
                    <span>{{ select.organization }} 信用卡</span>
                  </div>
                  <div class="item q-mt-lg">
                    <div class="title">地区</div>
                    <span>{{ select.cr }}</span>
                  </div>
                </div>

                <div class=" q-pl-lg q-mt-lg" style="margin-top: 50px">
                  <div class="item">
                    <div class="title">开卡费</div>
                    <!--                    <span>{{ Number(select.actualOpenCardPrice).toFixed(2) }} USD</span>-->
                    <span>{{ Number(expense.openCardFeeAmount).toFixed(2) }} USD</span>
                  </div>
                  <div class="item q-mt-lg">
                    <div class="title">充值手续费</div>
                    <!--                    <span>{{ Number.parseFloat(select.actualRechargeFeeRate) }}%</span>-->
                    <span>{{ Number.parseFloat(expense.rechargeFeeAmountRate) }}%</span>
                  </div>
                  <div class="item q-mt-lg">
                    <div class="title">预计扣款</div>
                    <span>{{
                        Number(openRecharge.count) * (Number(openRecharge.amount) + Number(expense.openCardFeeAmount) + (Number(openRecharge.amount) * Number.parseFloat(expense.rechargeFeeAmountRate) / 100))
                      }} USD</span>
                  </div>
                  <div class="item q-mt-lg">
                    <div class="title">钱包余额</div>
                    <span>{{ client.balance }} USD</span>
                  </div>
                </div>
              </div>

              <div style="word-break: break-all;width: 50%">
                <template v-if="select.description === 'photo'">
                  <img src="/success.png" width="120%">
                </template>
                <template v-else>
                  <div v-html="select.description"></div>
                  <div :hidden="this.ruleHidden">
                    <div v-html="select.ruleDescription"></div>
                  </div>
                </template>
              </div>

            </div>
            <div class=" q-pl-lg q-mt-lg" style="margin-top: 50px">
              <div v-if="!expanded" class="title" style="cursor: pointer;color: #3dd5f3" @click="exchange(expanded)">
                手动填写地址
              </div>
              <div v-else class="title" style="cursor: pointer;color: #3dd5f3" @click="exchange(expanded)">默认地址
              </div>
            </div>
            <div class=" q-pl-lg q-mt-lg" style="margin-top: 50px">
              <div class="item">
                <div class="title">国家</div>
                <q-input class="Ainput"
                         outlined
                         dense
                         disable
                         style="display: inline-block"
                         label="United States of America"
                >
                </q-input>
              </div>
              <div class="item q-mt-lg">
                <div class="title">洲</div>
                <q-select outlined
                          dense
                          clearable
                          v-model="openRecharge.state"
                          :disable="!expanded"
                          style="display: inline-block"
                          :options="countryList"
                          class="Ainput"
                          option-value="value"
                          emit-value
                          option-label="label"
                          map-options/>
              </div>
              <div class="item q-mt-lg">
                <div class="title">城市</div>
                <q-input class="Ainput"
                         outlined
                         dense
                         :disable="!expanded"
                         lazy-rules
                         :rules="[
                      (val) => val !== null && val !== ''  || '请输入城市']"
                         style="display: inline-block"
                         v-model="openRecharge.city"
                >
                </q-input>
              </div>
              <div class="item">
                <div class="title">街道地址</div>
                <q-input class="Ainput"
                         outlined
                         dense
                         :disable="!expanded"
                         lazy-rules
                         :rules="[
                      (val) => val !== null && val !== ''  || '请输入街道地址']"
                         style="display: inline-block"
                         v-model="openRecharge.address"
                >
                </q-input>
              </div>
              <div class="item">
                <div class="title">邮编</div>
                <q-input class="Ainput"
                         outlined
                         dense
                         :disable="!expanded"
                         lazy-rules
                         :rules="[
                      (val) => val !== null && val !== ''  || '请输入邮编',
                      (val) => val.length ===5  || '请输入正确的邮编'
                      ]"
                         style="display: inline-block"
                         v-model="openRecharge.zipCode"
                >
                </q-input>
              </div>
              <div class="item">
                <div class="title">姓</div>
                <q-input class="Ainput"
                         outlined
                         dense
                         :disable="!expanded"
                         lazy-rules
                         :rules="[
                      (val) => val !== null && val !== ''  || '请输入姓']"
                         style="display: inline-block"
                         v-model="openRecharge.lastName"
                >
                </q-input>
              </div>
              <div class="item">
                <div class="title">名字</div>
                <q-input class="Ainput"
                         outlined
                         dense
                         :disable="!expanded"
                         lazy-rules
                         :rules="[
                      (val) => val !== null && val !== ''  || '请输入名字']"
                         style="display: inline-block"
                         v-model="openRecharge.firstName"
                >
                </q-input>
              </div>
            </div>

            <div class=" q-pl-lg q-mt-lg" style="margin-top: 50px">
              <div class="item">
                <div class="title">计划充值</div>
                <q-input class="Ainput"
                         outlined
                         dense
                         lazy-rules
                         :rules="[
                      (val) => val !== null && val !== ''  || '请输入充值金额',
                      val=>(/^\d+(\.\d{1,3})?$/.test(val) || '最多输入3位小数'),
                      (val) => Number(val) >=  minAmount || '最低开卡额度 : $'+minAmount,
                      (val) => Number(val) <=  maxAmount || '最大开卡额度 : $'+maxAmount,
                      (val) => Number(client.balance) >=   Number(openRecharge.count)*(Number(openRecharge.amount) + Number(expense.openCardFeeAmount) + (Number(openRecharge.amount) * Number.parseFloat(expense.rechargeFeeAmountRate) / 100)) || '余额不足'
                    ]"
                         style="display: inline-block"
                         v-model="openRecharge.amount"
                >
                </q-input>
              </div>
              <div class="item">
                <div class="title">开卡数量</div>
                <q-input class="Ainput"
                         outlined
                         dense
                         lazy-rules
                         :rules="[
                      (val) => val !== null && val !== ''  || '请输入开卡数量',
                      (val) => Number(val) >=  minCount || '最少开卡数量 : '+minCount,
                      (val) => Number(val) <=  maxCount || '最大开卡数量 : '+maxCount,
                      (val) => Number(client.balance) >=  Number(openRecharge.count)*(Number(openRecharge.amount) + Number(expense.openCardFeeAmount) + (Number(openRecharge.amount) * Number.parseFloat(expense.rechargeFeeAmountRate) / 100)) || '余额不足'
                    ]"
                         style="display: inline-block"
                         v-model="openRecharge.count"
                >
                </q-input>
              </div>
              <div class="item q-mt-lg">
                <div class="title">备注</div>
                <q-input class="Ainput"
                         outlined
                         dense
                         style="display: inline-block"
                         v-model="openRecharge.remark"
                >
                </q-input>
              </div>
            </div>
          </div>
          <div class="q-ml-lg q-mt-lg">
            <q-btn label="开卡" color="light-blue" unelevated type="submit"
                   :disabled="!select.organization"></q-btn>
          </div>

        </q-form>

      </q-scroll-area>
    </q-drawer>

    <!-- 充值侧面弹窗-->
    <q-drawer
      v-model="drawer2"
      :width='1100'
      :breakpoint="500"
      overlay
      side="right"
      bordered
      @hide="this.cardId = '';this.cardNum = '';this.select={}"
    >
      <q-scroll-area class="fit">
        <q-form @submit="cardRechargeSubmit()" ref="rechargeCardRefs">
          <div style="padding: 10px;border-bottom: 1px solid rgba(0,0,0,0.2)" class="text-right">
            <q-icon name="ti-close" @click="rechargeClose()" class="flush q-mr-lg"></q-icon>
          </div>
          <div class="q-px-md q-py-lg">
            <div style="border-bottom: 1px solid rgba(0,0,0,0.1)" class="q-pb-sm"><span class="q-ml-md">充值</span>
            </div>
          </div>

          <div>
            <div class="q-pl-lg q-mt-lg q-ml-lg">
              <div class="item">
                <div class="title">卡号</div>
                <span>{{ this.cardNum }}</span>
              </div>

              <div class="item q-mt-lg">
                <div class="title">充值手续费</div>
                <span>{{ expense.rechargeFeeAmountRate }}</span>
              </div>

              <div class="item q-mt-lg">
                <div class="title">预计扣款</div>
                <span>{{
                    Number(cardRecharge.amount) + (Number(cardRecharge.amount) * Number.parseFloat(expense.rechargeFeeAmountRate) / 100)
                  }} USD</span>
              </div>

            </div>

            <div class=" q-pl-lg q-mt-lg q-ml-lg" style="margin-top: 50px">
              <div class="item q-mt-lg">
                <div class="title">钱包余额</div>
                <span>{{ client.balance }} USD</span>
              </div>
            </div>

            <div class=" q-pl-lg q-mt-lg q-ml-lg" style="margin-top: 50px">
              <div class="item">
                <div class="title">计划充值</div>
                <q-input class="Ainput"
                         outlined
                         dense
                         lazy-rules
                         :rules="[
                      (val) => val !== null && val !== ''  || '请输入充值金额',
                      (val) => Number(val) <=  maxAmount || '最大开卡额度 : $'+maxAmount,
                      (val) => Number(client.balance) >=  Number(val) + (Number(val) * Number.parseFloat(expense.rechargeFeeAmountRate) / 100) || '余额不足',
                    ]"
                         style="display: inline-block"
                         v-model="cardRecharge.amount"
                >
                </q-input>

              </div>
            </div>
          </div>

          <div class="q-pl-lg q-mt-lg q-ml-lg">
            <!--            <q-btn label="充值" color="light-blue" unelevated @click="cardRechargeSubmit()"></q-btn>-->
            <q-btn label="充值" color="light-blue" unelevated type="submit"></q-btn>
          </div>
        </q-form>
      </q-scroll-area>
    </q-drawer>

    <!-- 销卡侧面弹窗-->
    <q-drawer
      v-model="drawer3"
      :width='1100'
      :breakpoint="500"
      overlay
      side="right"
      bordered
      @hide="this.cardId = '';this.cardNum = '';this.select={}"
    >
      <q-scroll-area class="fit">
        <div style="padding: 10px;border-bottom: 1px solid rgba(0,0,0,0.2)" class="text-right">
          <q-icon name="ti-close" @click="cancelClose()" class="flush q-mr-lg"></q-icon>
        </div>
        <div class="q-px-md q-py-lg">
          <div style="border-bottom: 1px solid rgba(0,0,0,0.1)" class="q-pb-sm"><span class="q-ml-md">销卡</span>
          </div>
        </div>

        <div>
          <div class="q-pl-lg">
            <div class="item">
              <div style="font-size: 18px; line-height: 30px;">
                1、销卡不可撤销
                <br>
                2、发起销卡后无法再进行交易
                <br>
                3、发起销卡后无法再收到退款
              </div>
            </div>
          </div>
          <div class="q-pl-md q-mt-lg">
            <div class="item">
              <q-checkbox size="30px" :color="val?'light-blue':''" :class="[val?'cancel':'noCancel']" v-model="val"
                          label="我已知晓、如已确认以上信息，请点击左侧小方框"/>
            </div>
          </div>

        </div>

        <div class="q-pl-lg q-mt-lg">
          <q-btn label="销卡" color="light-blue" unelevated @click="cardCancelSubmit()" :disabled="!this.val"></q-btn>
        </div>
      </q-scroll-area>
    </q-drawer>

    <!-- 银行卡详情侧面弹窗-->
    <q-drawer
      v-model="drawer4"
      :width='1100'
      :breakpoint="500"
      overlay
      side="right"
      bordered
      @hide="this.cardId = '';this.cardNum = '';this.select={}"
    >
      <q-scroll-area class="fit">
        <div style="padding: 10px;border-bottom: 1px solid rgba(0,0,0,0.2)" class="flex justify-between full-width">
          <b class="q-ml-md" style="font-size: 25px;color: #00bcd4">{{ this.cardDetail.number }}</b>
          <q-icon name="ti-close" @click="drawer4=false" class="flush q-mr-lg"></q-icon>
        </div>
        <div class="q-px-md q-py-lg">
          <div style="border-bottom: 1px solid rgba(0,0,0,0.1);font-size: 22px" class="q-pb-sm">
            <span class="q-ml-md">卡片信息</span>
            <span class="q-ml-md"
                  style="background-color: #26A69A;color: white;padding: 5px 10px;border-radius: 5px;font-size: 15px">正常</span>
          </div>
        </div>

        <div>
          <!--          <span class="q-pl-lg q-mt-lg q-ml-lg" style="font-size: 15px">ID：</span>-->
          <!--          <b>{{ this.cardDetail.id }}</b>-->
          <div class="q-pl-lg q-ml-lg flex">
            <div>
              <div class="item q-mt-lg">
                <div class="title">类型</div>
                <span>{{ this.cardDetail.organization }}</span>
              </div>

              <div class="item q-mt-lg">
                <div class="title">开卡时间</div>
                <span>{{
                    this.cardDetail.createTime ? whc.Date.formatDateTime(new Date(this.cardDetail.createTime)) : '-'
                  }}</span>
              </div>

              <div class="item q-mt-lg">
                <div class="title">销卡时间</div>
                <span>{{
                    this.cardDetail.state === 0 ? this.cardDetail.modifyTime ? whc.Date.formatDateTime(new Date(this.cardDetail.modifyTime)) : '-' : '-'
                  }}</span>
              </div>
              <div class="item q-mt-lg">
                <div class="title">备注</div>
                <span>{{ this.cardDetail.remark ? this.cardDetail.remark : '-' }}</span>
              </div>
            </div>

            <div style="margin-left: 200px">

              <div class="item q-mt-lg">
                <div class="title">余额</div>
                <span>{{ cardBalance }}</span>
              </div>

              <div class="item q-mt-lg">
                <div class="title">有效期</div>
                <span>{{ this.cardDetail.expiryDate }}</span>
              </div>

              <div class="item q-mt-lg">
                <div class="title">安全码</div>
                <span>{{ this.cardDetail.cvv }}</span>
              </div>
            </div>
          </div>
        </div>
      </q-scroll-area>
    </q-drawer>

    <q-dialog v-model="bar2">
      <q-card class="inner" style="width: 100%">
        <q-card-section>
          <div class="text-h6">修改备注</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <span>请输入新备注</span>
        </q-card-section>

        <q-card-section style="max-height: 50vh" class="scroll">
          <q-input
            v-model="remark"
            dense outlined
            type="text"
          >
          </q-input>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" @click="closeRemark"/>
          <q-btn flat label="确定" color="primary" @click="cardRemarkEdit"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 提现弹窗 -->
    <q-dialog v-model="bar3">
      <q-card class="inner" style="width: 100%">
        <q-bar style="height: 70px;background-color: #e0efff">
          <div style="font-size: 20px;font-weight: 600;padding: 0 0 0 12px">资金转出</div>
          <q-space/>
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section style="max-height: 50vh" class="scroll">
          <div class="flex justify-center">
            <q-form
              class="q-gutter-sm"
              ref="cardCashOutForm"
              style="width: 90%;"
            >
              <div style="padding: 30px 0 20px 0"><span>扣款卡片</span></div>
              <q-input
                :label="cardNum"
                dense outlined square disable
                type="text"
              >
              </q-input>

              <div style="padding: 10px 0 20px 0"><span>卡内可用余额</span></div>
              <q-input
                :label="this.showCardBalance+' USD'"
                dense outlined square disable
                type="text"
              >
              </q-input>

              <div style="padding: 10px 0 20px 0"><span style="color: red">* </span><span>转出金额</span></div>
              <q-input
                v-model="modify.amount"
                dense outlined clearable square
                autocomplete="new-password"
                lazy-rules
                :rules="[
                          val => val !== null && val !== ''  || '请输入转出金额',
                          val => Number(showCardBalance) >=  Number(val) || '余额不足',
                          val=>(/^\d+(\.\d{1,3})?$/.test(val) || '最多输入3位小数'),
                        ]"
              >
              </q-input>
            </q-form>
          </div>
        </q-card-section>

        <!--        <q-separator/>-->

        <q-card-actions align="right">
          <q-btn flat label="确定" color="primary" @click="cardCashOutSubmit"/>
          <q-btn flat label="取消" color="primary" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <w-modal ref="selectModal" title="批量删卡" @on-ok="batchCancelCard2" @on-cancel="cancelBatchCancelCard" min-width="500px">
      <div>1、请确认选择的卡号是需要进行销卡的卡号</div>
      <div>2、销卡操作<span style="color: red">不可撤销</span></div>
      <div>3、发起销卡后该卡<span style="color: red">无法再进行交易</span></div>
      <div>4、发起销卡后该卡<span style="color: red">无法再收到退款</span></div>
      <br>
      <div>批量销卡为异步操作，点击确认按钮后。</div>
      <div>若看到选择的卡还为【激活】状态，请稍等几分钟后再刷新列表查看。</div>
    </w-modal>

    <!--    <w-modal ref="ruleModal" title="风控说明" :show-button="false">-->
    <!--      <div v-html="select.ruleDescription"></div>-->
    <!--    </w-modal>-->

  </div>
</template>


<script>
import WCard from "components/WCard";
import WTable from "components/WTable.vue";
import WPage from "components/WPage.vue";
import WEmpty from "components/WEmpty.vue";
import WDatePickerSecond from "components/WDatePickerSecond.vue";
import {getCurrentDate} from "src/morejs/utils";
import {_whc} from "src/morejs/_whc";
import crypt from "src/morejs/crypt";
import {KJUR} from "jsrsasign";
import {clear} from "core-js/internals/task";

export default {
  components: {
    // eslint-disable-next-line vue/no-unused-components
    WDatePickerSecond,
    WEmpty,
    WPage,
    WTable,
    WCard
  },
  name: 'PageIndex',
  data() {
    return {
      expanded: false,
      drawer: false,
      bar2: false,
      bar3: false,
      drawer2: false,
      drawer3: false,
      drawer4: false,
      ruleHidden: true,
      val: false,
      selected: false,
      minAmount: 10,
      minCount: 1,
      maxCount: 100,
      maxAmount: 100000,
      select: {},
      modify: {
        amount: '',
      },
      remark: '',
      getCurrentDate,
      whc: _whc,
      total: 0,
      cardNum: '',
      cardBalance: '',
      showCardBalance: '',
      tagsName: 'name',
      cardDetail: {},
      cardId: '',
      client: {},
      expense: {},
      openRecharge: {
        amount: 10,
        count: 1,
        remark: '',
        firstName: 'Edgar',
        lastName: 'Hettinger',
        city: 'San Jose',
        address: '2381 Zanker Rd Ste 110',
        state: 'CA',
        zipCode: '95131',
      },
      description: {
        '440872|451946|485997|556371': `推荐在Facebook、Google、Telegram、TikTok、Amazon、PayPal、Apple、TWITTER、Linked、Shopify、Walmart、YouTube、Alibaba、eBay、TAOBAO、Alipay、RISER、viber、Infobip、AliExpress等场景上付款。
                <br>
                <br> 警告：该卡BIN禁止在Steam、WALMART、Uber、Foodpanda这4个场景上交易使用，如违反发卡行严令禁止的交易场景将强制注销该卡。`

      },
      cardRecharge: {
        amount: 10,
        remark: ''
      },
      proxyList: [],
      selectIdList: [],
      bankCardList: [],
      clientBankCardList: [],
      allCrList: [],
      userCardsDetail: [],
      addNewObj: {},
      queryObj: {
        pageNumber: 1,
        pageSize: 10
      },
      stateList: [
        {
          value: 1,
          label: '有效卡',
          color: '#b14fa2'
        },
        {
          value: 0,
          label: '已销卡',
          color: 'red'
        }
      ],
      countryList: [
        {
          value: 'AK',
          label: 'AK (Alaska)'
        },
        {
          value: 'AL',
          label: 'AL (Alabama)'
        },
        {
          value: 'AR',
          label: 'AR (Arkansas)'
        },
        {
          value: 'AZ',
          label: 'AZ (Arizona)'
        },
        {
          value: 'CA',
          label: 'CA (California)'
        },
        {
          value: 'CO',
          label: 'CO (Colorado)'
        },
        {
          value: 'CT',
          label: 'CT (Connecticut)'
        },
        {
          value: 'DC',
          label: 'DC (District of Columbia)'
        },
        {
          value: 'DE',
          label: 'DE (Delaware)'
        },
        {
          value: 'FL',
          label: 'FL (Florida)'
        },
        {
          value: 'GA',
          label: 'GA (Georgia)'
        },
        {
          value: 'HI',
          label: 'HI (Hawaii)'
        },
        {
          value: 'IA',
          label: 'IA (Iowa)'
        },
        {
          value: 'ID',
          label: 'ID (Idaho)'
        },
        {
          value: 'IL',
          label: 'IL (Illinois)'
        },
        {
          value: 'IN',
          label: 'IN (Indiana)'
        },
        {
          value: 'KS',
          label: 'KS (Kansas)'
        },
        {
          value: 'KY',
          label: 'KY (Kentucky)'
        },
        {
          value: 'LA',
          label: 'LA (Louisiana)'
        },
        {
          value: 'MA',
          label: 'MA (Massachusetts)'
        },
        {
          value: 'MD',
          label: 'MD (Maryland)'
        },
        {
          value: 'ME',
          label: 'ME (Maine)'
        },
        {
          value: 'MI',
          label: 'MI (Michigan)'
        },
        {
          value: 'MN',
          label: 'MN (Minnesota)'
        },
        {
          value: 'MO',
          label: 'MO (Missouri)'
        },
        {
          value: 'MS',
          label: 'MS (Mississippi)'
        },
        {
          value: 'MT',
          label: 'MT (Montana)'
        },
        {
          value: 'NC',
          label: 'NC (North Carolina)'
        },
        {
          value: 'ND',
          label: 'ND (North Dakota)'
        },
        {
          value: 'NE',
          label: 'NE (Nebraska)'
        },
        {
          value: 'NH',
          label: 'NH (New Hampshire)'
        },
        {
          value: 'NJ',
          label: 'NJ (New Jersey)'
        },
        {
          value: 'NM',
          label: 'NM (New Mexico)'
        },
        {
          value: 'NV',
          label: 'NV (Nevada)'
        },
        {
          value: 'NY',
          label: 'NY (New York)'
        },
        {
          value: 'OH',
          label: 'OH (Ohio)'
        },
        {
          value: 'OK',
          label: 'OK (Oklahoma)'
        },
        {
          value: 'OR',
          label: 'OR (Oregon)'
        },
        {
          value: 'PA',
          label: 'PA (Pennsylvania)'
        },
        {
          value: 'RI',
          label: 'RI (Rhode Island)'
        },
        {
          value: 'SC',
          label: 'SC (South Carolina)'
        },
        {
          value: 'SD',
          label: 'SD (South Dakota)'
        },
        {
          value: 'TN',
          label: 'TN (Tennessee)'
        },
        {
          value: 'TX',
          label: 'TX (Texas)'
        },
        {
          value: 'UT',
          label: 'UT (Utah)'
        },
        {
          value: 'VA',
          label: 'VA (Virginia)'
        },
        {
          value: 'VT',
          label: 'VT (Vermont)'
        },
        {
          value: 'WA',
          label: 'WA (Washington)'
        },
        {
          value: 'WI',
          label: 'WI (Wisconsin)'
        },
        {
          value: 'WV',
          label: 'WV (West Virginia)'
        },
        {
          value: 'WY',
          label: 'WY (Wyoming)'
        }
      ],
      cardCountryList: [
        {
          value: 1,
          label: '有效卡',
          color: '#b14fa2'
        },
        {
          value: 0,
          label: '已销卡',
          color: 'red'
        }
      ],
      list: [],
      columns: [
        {
          title: '卡号',
          slot: 'number',
          minWidth: 100
        },
        {
          title: '卡组织',
          slot: 'organization',
          minWidth: 100
        },
        {
          title: '余额',
          slot: 'balance',
          minWidth: 100
        },
        {
          title: '卡头',
          slot: 'bin',
          minWidth: 100
        },
        {
          title: '有效期',
          slot: 'expiryDate',
          minWidth: 100
        },
        {
          title: '安全码',
          slot: 'cvv',
          minWidth: 100
        },
        {
          title: '备注',
          slot: 'remark',
          minWidth: 100
        },
        {
          title: '开卡时间',
          slot: 'createTime',
          minWidth: 100
        },
        {
          title: '操作',
          slot: 'action',
          minWidth: 100
        }
      ]
    }
  },
  mounted() {
    window.ruleClick = this.ruleClick
    if (this.$route.query && this.$route.query.id) {
      this.queryObj.taskId = this.$route.query.id
    }
    this.getList()
    this.getUserCardsDetail()
    // this.getCurrent()
    try {
      this.client = JSON.parse(localStorage.getItem("client_current"))
    } catch (aa) {

    }

    // try {
    //   this.expense = JSON.parse(localStorage.getItem("expense"))
    // } catch (aa) {
    //
    // }
    this.getAllBankCards()
    this.getClientAllBankCards()
  },
  methods: {
    input(card) {
      this.ruleHidden = true
      if (card.adapterSign === 'dnk') {
        this.openRecharge.amount = 30
      } else if (card.adapterSign === 'vm-card2' || card.adapterSign === 'vm-card') {
        if (card.bin === '534786') {
          this.openRecharge.amount = 42
        } else if (card.bin === '553370' || card.bin === '404038') {
          this.openRecharge.amount = 21
        } else if (card.bin === '553437') {
          this.openRecharge.amount = 10
        } else if (card.bin === '491090' || card.bin === '428836' || card.bin === '433451' || card.bin === '440872' || card.bin === '451946' || card.bin === '553437') {
          this.openRecharge.amount = 10
        } else {
          this.openRecharge.amount = 20
        }

      } else {
        this.openRecharge.amount = 10
      }
      this.minAmount = this.openRecharge.amount
      if (card.adapterSign === 'vm-card2') {
        this.maxAmount = 350
      } else {
        this.maxAmount = 100000
      }
      this.getExpense(card.id)
    },
    getList() {
      this.$axios.$get('/api_client/user_bank_card', this.queryObj).then(res => {
        if (res && res.code === 0) {
          this.total = res.total
          this.list = res.rows
          this.list.forEach(item => {
            this.$set(item, 'balance', '')
            if (item.state === 1 && (item.adapterSign === 'vm-card2' || item.adapterSign === 'vm-card' || item.adapterSign === 'ipe')) {
              this.getUserCardsBalance(item, true);
            }
          })
        }
      })
    },
    ruleClick() {
      this.ruleHidden = !this.ruleHidden
    },
    exchange(expanded) {
      this.expanded = !expanded
      if (!this.expanded) {
        this.openRecharge.firstName = 'Edgar'
        this.openRecharge.lastName = 'Hettinger'
        this.openRecharge.city = 'San Jose'
        this.openRecharge.address = '2381 Zanker Rd Ste 110'
        this.openRecharge.state = 'CA'
        this.openRecharge.zipCode = '95131'
      }
    },
    getExpense(bankId) {
      this.$axios.$get(`/api_client/expense?bankId=${bankId}`, this.queryObj).then(res => {
        if (res && res.code === 0) {
          this.expense = res.content
        }
      })
    },
    openRemark(data) {
      this.cardId = data.id
      this.bar2 = true
    },
    closeRemark() {
      this.cardId = ''
      this.remark = ''
      this.bar2 = false
    },
    changeCheck(data) {
      this.selectIdList = []
      data.forEach(c => {
        this.selectIdList.push(c.id)
      })
    },
    changeAllCheck(data) {
      this.selectIdList = []
      data.forEach(c => {
        this.selectIdList.push(c.id)
      })
    },
    cardClick(data) {
      this.ruleHidden = true
      if (data.adapterSign === 'dnk') {
        this.openRecharge.amount = 30
      } else if (data.adapterSign === 'vm-card2' || data.adapterSign === 'vm-card') {
        if (data.bin === '534786') {
          this.openRecharge.amount = 42
        } else if (data.bin === '553370' || data.bin === '404038') {
          this.openRecharge.amount = 21
        } else if (data.bin === '553437') {
          this.openRecharge.amount = 10
        } else if (data.bin === '491090' || data.bin === '428836' || data.bin === '433451' || data.bin === '440872' || data.bin === '451946' || data.bin === '553437') {
          this.openRecharge.amount = 10
        } else {
          this.openRecharge.amount = 20
        }

      } else {
        this.openRecharge.amount = 10
      }
      this.minAmount = this.openRecharge.amount
      if (data.adapterSign === 'vm-card2') {
        this.maxAmount = 350
      } else {
        this.maxAmount = 100000
      }
      this.drawer = true
      this.select = data
      this.ruleHidden = true
      this.expense = this.getExpense(data.id)
    },
    cardClickFalse() {
      this.$notify.error("您未开通开卡权限，请联系在线客服激活账户。")
    },
    cardRemarkEdit() {
      const cancelForm = {
        userBankCardId: this.cardId,
        remark: this.remark
      }
      this.$axios.$postForm('/api_client/edit_card', cancelForm).then((resp) => {
        this.bar2 = false
        this.getList()
      })
    },
    getUserCardsDetail() {
      this.$axios.$get('/api_client/card_detail', this.queryObj).then(res => {
        if (res && res.code === 0) {
          this.userCardsDetail = res.content
        }
      })
    },
    cardCashOutSubmit() {
      // this.$axios.$get('/api_client/card_detail', this.queryObj).then(res => {
      //   if (res && res.code === 0) {
      //     this.userCardsDetail = res.content
      //   }
      // })

      this.$refs.cardCashOutForm.validate().then(success => {
        if (success) {
          const cashOutForm = {
            amount: this.modify.amount,
          }
          this.$axios.$postForm('/api_client/' + this.cardId + '/card_cash_out', cashOutForm).then((resp) => {
            if (resp && resp.code === 0) {
              this.modify.amount = ''
              this.bar3 = false
              this.cardNum = ''
              this.showCardBalance = ''
            }
          })
        }
      })
    },
    getClientCurrent() {
      this.$axios.$get('/api_client/current', {skipDefault: true}).then(res => {
        this.client = res.content
        localStorage.setItem("client_current", JSON.stringify(this.client))
      })
    },
    getUserCardsBalance(data, show) {
      this.$axios.$get(`/api_client/card_balance?bankNum=${data.number}`, this.queryObj).then(res => {
        if (res && res.code === 0) {
          if (res.content === '请重新获取余额') {
            this.$notify.error("查询频繁")
            return;
          }
          if (show) {
            data.balance = Number(res.content).toFixed(2) + ' USD';
          } else {
            this.cardBalance = Number(res.content).toFixed(2) + ' USD';
          }
          this.showCardBalance = Number(res.content).toFixed(2);
        } else {
          this.$notify.error("查询频繁")
        }
      })
    },
    openCard(select) {
      this.$refs.openCardRefs.validate().then(success => {
        if (success) {
          const openForm = {
            bankCardId: select.id,
            amount: this.openRecharge.amount,
            remark: this.openRecharge.remark,
            count: this.openRecharge.count,
            address: this.openRecharge.address,
            state: this.openRecharge.state,
            city: this.openRecharge.city,
            zipCode: this.openRecharge.zipCode,
            firstName: this.openRecharge.firstName,
            lastName: this.openRecharge.lastName,
            custom: this.expanded,
          }
          this.$axios.$postForm('/api_client/open_card', openForm).then((resp) => {
            if (resp && resp.code === 0) {
              this.drawer = false
              this.getClientCurrent()
            }
          })
        }
      })
    },
    cardRechargeSubmit() {
      this.$refs.rechargeCardRefs.validate().then(success => {
        if (success) {
          const rechargeForm = {
            bankCardId: this.cardId,
            amount: this.cardRecharge.amount
          }
          this.$axios.$postForm('/api_client/recharge', rechargeForm).then((resp) => {
            if (resp && resp.code === 0) {
              this.drawer2 = false
              this.getClientCurrent()
            }
          })
        }
      })
    },
    cardCancelSubmit() {
      const cancelForm = {
        userBankCardId: this.cardId
      }
      this.$axios.$postForm('/api_client/cancel_card', cancelForm).then((resp) => {
        if (resp && resp.code === 0) {
          this.drawer3 = false
          this.val = false
          this.getList()
          this.getClientCurrent()
        } else {
          this.$notify.error("查询频繁，请稍后再重新发起销卡")
        }
      })
    },
    getAllBankCards() {
      this.$axios.$get('/api_client/all_bank_card', this.queryObj).then(res => {
        if (res && res.code === 0) {
          this.bankCardList = res.content;
        }
      })
    },
    getClientAllBankCards() {
      this.$axios.$get('/api_client/client_all_bank_card', this.queryObj).then(res => {
        if (res && res.code === 0) {
          this.clientBankCardList = res.content;
        }
      })
    },
    detailClick(data) {
      this.cardBalance = '-'
      this.getUserCardsBalance(data, false)
      this.drawer4 = true
      this.cardDetail = data
    },
    detailClick2(data) {
      // this.$router.push('/card_detail/' + data.id)
      window.open('/card_detail/' + data.id)
    },
    rechargeClick(data) {
      this.ruleHidden = true
      if (data.adapterSign === 'dnk') {
        this.cardRecharge.amount = 30
      } else {
        if ((data.adapterSign === 'vm-card2' || data.adapterSign === 'vm-card') && (data.bin === '534786' || data.bin === '553370' || data.bin === '404038')) {
          this.cardRecharge.amount = 21
        } else {
          this.cardRecharge.amount = 10
        }

      }
      this.minAmount = this.openRecharge.amount
      if (data.adapterSign === 'vm-card2') {
        this.maxAmount = 350
      } else {
        this.maxAmount = 100000
      }
      this.drawer2 = true
      this.cardNum = data.number
      this.cardId = data.id
      this.getExpense(data.bankCardId)
    },
    cancelClick(data) {
      this.drawer3 = true
      this.cardId = data.id
    },
    cashOutClick(data) {
      this.bar3 = true
      this.getUserCardsBalance(data, true)
      this.cardNum = data.number
      this.cardId = data.id
    },
    rechargeClose() {
      this.drawer2 = false
    },
    cancelClose() {
      this.drawer3 = false
      this.val = false
    },
    filterProxyListFn(val, update) {
      update(() => {
        this.proxyList = this.allProxyList.filter(v => v.sign.indexOf(val) > -1)
      })
    },
    changeDate(date) {
      this.queryObj.fromDate = date.from
      this.queryObj.toDate = date.to
    },
    query() {
      // this.queryObj.pageNumber = 1
      this.getList()
    },
    batchCancelCard() {
      // this.queryObj.pageNumber = 1
      if (!this.selected || this.selectIdList.length === 0) {
        this.selected = !this.selected
      } else {
        this.$refs.selectModal.show()
      }
    },
    batchCancelCard2() {
      this.$refs.selectModal.hide()
      if (this.selectIdList.length === 0) {
        this.$notify.error("请选择需要删除的信用卡")
      } else {
        var aa = JSON.stringify(this.selectIdList)
        const cancelForm = {
          userBankCardIds: aa
        }
        this.$axios.$postForm('/api_client/batch_cancel_card', cancelForm).then((resp) => {
          if (resp && resp.code === 0) {
            this.selectIdList = []
            this.selected = !this.selected
            this.$refs.listTable.clear()
            this.getList()
          }
        })
      }
    },
    cancelBatchCancelCard(){
      this.selected = false
      this.selectIdList = []
      this.$refs.listTable.clear()
    },
    reset() {
      this.queryObj = {
        pageNumber: 1,
        pageSize: 10,
        clientId: '',
        registerId: ''
      }
      this.getList()
    },
    matchState(state) {
      for (let item of this.stateList) {
        if (item.value == state) {
          return `<span style="color: ${item.color}">${item.label}</span>`
        }
      }
      return `<span>-</span>`
    },
    filterFn(val, update) {
      update(() => {
        this.crList = this.allCrList.filter(v => v.programmedName.indexOf(val) > -1)
      })
    },
    options(date) {
      return date <= this.getCurrentDate(new Date().getTime(), '/')
    },
    pageNumberChange(current) {
      this.queryObj.pageNumber = current
      this.getList()
    },
    pageSizeChange(current) {
      // this.queryObj.pageNumber = 1
      this.queryObj.pageSize = current
      this.getList()
    }
  }
}
</script>
<style lang="stylus" scoped>
.number {
  color: $light-blue;
  font-size: 30px;
  margin-left: 10px
}

.flush {
  cursor: pointer;
}

.flush:hover {
  color: $blue-3;
}

.box:hover {
  box-shadow: 0px 6px 10px #e0e0e0;
}

.item {
  font-size: 15px;

}

.title {
  display: inline-block;
  width: 130px;
  font-size: 15px;
  color: #777986;
}

.cancel {
  color: $light-blue;

}

.noCancel {
  color: #9496A1;
}

.Ainput {
  width: calc(100% - 200px);
}

.inner {
  max-width: 500px !important;
}
</style>
