# [1.1.0](https://github.com/kuzzleio/kourou/compare/v1.0.1...v1.1.0) (2025-04-09)


### Bug Fixes

* use main branches for template scaffolding ([cc02982](https://github.com/kuzzleio/kourou/commit/cc02982900c6d8b2643da4b9c378c74d7b863dd3))


### Features

* add apiKey support for the es:migrate command ([06110fb](https://github.com/kuzzleio/kourou/commit/06110fbb0c9c0d221027ea6cfb4ad013984e2c32))
* be able to only transfert index mappings and settings ([f992f17](https://github.com/kuzzleio/kourou/commit/f992f170248359ceb7004b931efd36cb4de03793))

# [1.1.0-beta.1](https://github.com/kuzzleio/kourou/compare/v1.0.1...v1.1.0-beta.1) (2025-04-09)


### Bug Fixes

* use main branches for template scaffolding ([cc02982](https://github.com/kuzzleio/kourou/commit/cc02982900c6d8b2643da4b9c378c74d7b863dd3))


### Features

* add apiKey support for the es:migrate command ([06110fb](https://github.com/kuzzleio/kourou/commit/06110fbb0c9c0d221027ea6cfb4ad013984e2c32))
* be able to only transfert index mappings and settings ([f992f17](https://github.com/kuzzleio/kourou/commit/f992f170248359ceb7004b931efd36cb4de03793))

## [1.0.1](https://github.com/kuzzleio/kourou/compare/v1.0.0...v1.0.1) (2024-12-17)


### Bug Fixes

* npm release ([05ab902](https://github.com/kuzzleio/kourou/commit/05ab90206efcf461ebb356390c131cb50102c1fe))
* npm release ([a80beb4](https://github.com/kuzzleio/kourou/commit/a80beb44d627113390614da251ecc177e74a8936))
* provide the right npm token ([b13016d](https://github.com/kuzzleio/kourou/commit/b13016d0a40b6fc667581d54db9bdf104a5b4010))

## [1.0.1-beta.1](https://github.com/kuzzleio/kourou/compare/v1.0.0...v1.0.1-beta.1) (2024-12-17)


### Bug Fixes

* npm release ([05ab902](https://github.com/kuzzleio/kourou/commit/05ab90206efcf461ebb356390c131cb50102c1fe))
* npm release ([a80beb4](https://github.com/kuzzleio/kourou/commit/a80beb44d627113390614da251ecc177e74a8936))
* provide the right npm token ([b13016d](https://github.com/kuzzleio/kourou/commit/b13016d0a40b6fc667581d54db9bdf104a5b4010))

# 1.0.0 (2024-12-17)


### Bug Fixes

* add container_name in docker compose for tests ([913223d](https://github.com/kuzzleio/kourou/commit/913223d4adef23c456e11d750c418b77093a8e90))
* add lib/ in package ([7cce18f](https://github.com/kuzzleio/kourou/commit/7cce18f65326ccd4643431f08e3de70bea84dfe5))
* app:scaffold command description ([#175](https://github.com/kuzzleio/kourou/issues/175)) ([bb02647](https://github.com/kuzzleio/kourou/commit/bb0264794cc5fc627ed358fb4d19bab765d22416))
* **appScaffold / start-services:** fix colors and bold for commands ([8ff9a06](https://github.com/kuzzleio/kourou/commit/8ff9a060a1184450bd79d02b8757d595d00c9b88))
* attempt to cleanly finish dumping PaaS ES documents if dumping failed ([16fad0f](https://github.com/kuzzleio/kourou/commit/16fad0f479dc05ae622d29b923ecf38b4ceaffd9))
* ci cd files ([ba8493b](https://github.com/kuzzleio/kourou/commit/ba8493be80aa21436abc3508720d0040aedb4209))
* ci is passing locally ([216acb8](https://github.com/kuzzleio/kourou/commit/216acb87d581aaadbf47c71942e4d275a41db280))
* doctor.ts type error ([d2122ce](https://github.com/kuzzleio/kourou/commit/d2122ce6aa0eab2e780843a0287f106b3fba3b07))
* impersonate test ([29f0e2f](https://github.com/kuzzleio/kourou/commit/29f0e2f78d08d29cd11c2b57db1f0da1de41eff9))
* It should now use the proper GH_TOKEN ([6b4b949](https://github.com/kuzzleio/kourou/commit/6b4b949b7f1c4e5564174bc9cc5d505c850c16ed))
* Remove --omit=dev in release ([294ed81](https://github.com/kuzzleio/kourou/commit/294ed81b2f9d11cbbd6716823c2b69d2924f5acd))
* return a unique color for each pod in the PaaS logs ([efaeb41](https://github.com/kuzzleio/kourou/commit/efaeb41a56a5347c06bead6413acb97cd4f5cedd))
* scaffold command should delete .git folder ([f83717b](https://github.com/kuzzleio/kourou/commit/f83717bb7c7be8ff6fe481127af1d563b12806ac))
* semantic release file had the wrong name ([5acf769](https://github.com/kuzzleio/kourou/commit/5acf769ff8daf0d3d775aa61379594fcd4d40c49))
* working tests ([09a166d](https://github.com/kuzzleio/kourou/commit/09a166d34bee56023badcd0e2feda0a6e64ad1b8))


### Features

* add command for dumping an Elasticsearch instance in the PaaS ([935f210](https://github.com/kuzzleio/kourou/commit/935f21006681fe62481ebf01bfafed57f87e9b5d))
* add flag to the PaaS ES dump command to configure the document batch size ([edd3440](https://github.com/kuzzleio/kourou/commit/edd34404bc0aa9571a411604fbe14c40e9cf65b4))
* add nicer result logs for PaaS snapshot commands ([#207](https://github.com/kuzzleio/kourou/issues/207)) ([937c921](https://github.com/kuzzleio/kourou/commit/937c921929c4f4d0add02c75547900ccec9f210e))
* Add semantic release ([633e242](https://github.com/kuzzleio/kourou/commit/633e242d2bbf1c5e136dd7412c89325742e3e1e8))
* check the batch size ([0c64151](https://github.com/kuzzleio/kourou/commit/0c64151bd6b46abaa9ae73fd26704aee5061dfc2))
* implement PaaS logs follow ([757baf7](https://github.com/kuzzleio/kourou/commit/757baf7eddd9554155b97f1e6d72233116aca133))
* implement streamed HTTP queries ([481c202](https://github.com/kuzzleio/kourou/commit/481c20239d20dd5934982f0fb638d259a63786c1))
* **paas:** Update paas snapshot api call ([a103dd4](https://github.com/kuzzleio/kourou/commit/a103dd4215b5a1c5a62ed31c5e036d0beba293cf))
* retrieve the PaaS logs using a streamed query ([d0ffd6e](https://github.com/kuzzleio/kourou/commit/d0ffd6ebe983e46e4e18e03fd3cdddbf4cd86949))
* store dumped PaaS ES documents in a single JSONL file ([8b0cd2c](https://github.com/kuzzleio/kourou/commit/8b0cd2ce18c75f7c6db0737a5d7c2892721c0e42))
* support changing the NPM registry hostname ([fc4346e](https://github.com/kuzzleio/kourou/commit/fc4346e03a5f5ba603ad43ad0209e92552f2c24e))
* support displaying PaaS logs timestamps ([89e4138](https://github.com/kuzzleio/kourou/commit/89e4138ad2458570c1d5c77ee3588b41798122e5))
* support limiting the PaaS logs amount ([3247ea1](https://github.com/kuzzleio/kourou/commit/3247ea117a5bfa3a5ca38f14a608d46855ebe7a4))
* support selecting which pod to get PaaS logs from ([3647eb5](https://github.com/kuzzleio/kourou/commit/3647eb52717020eee330841251cf750a2d687c5a))
* support specifying a starting time for PaaS logs ([657aa8f](https://github.com/kuzzleio/kourou/commit/657aa8fd16af78a850606660ca07c83be6fab292))
* support specifying an ending time for PaaS logs ([95d7018](https://github.com/kuzzleio/kourou/commit/95d7018d67f66eb3980e6d932b5b80484929afd2))

# 1.0.0-beta.1 (2024-12-17)


### Bug Fixes

* add container_name in docker compose for tests ([913223d](https://github.com/kuzzleio/kourou/commit/913223d4adef23c456e11d750c418b77093a8e90))
* add lib/ in package ([7cce18f](https://github.com/kuzzleio/kourou/commit/7cce18f65326ccd4643431f08e3de70bea84dfe5))
* app:scaffold command description ([#175](https://github.com/kuzzleio/kourou/issues/175)) ([bb02647](https://github.com/kuzzleio/kourou/commit/bb0264794cc5fc627ed358fb4d19bab765d22416))
* **appScaffold / start-services:** fix colors and bold for commands ([8ff9a06](https://github.com/kuzzleio/kourou/commit/8ff9a060a1184450bd79d02b8757d595d00c9b88))
* attempt to cleanly finish dumping PaaS ES documents if dumping failed ([16fad0f](https://github.com/kuzzleio/kourou/commit/16fad0f479dc05ae622d29b923ecf38b4ceaffd9))
* ci cd files ([ba8493b](https://github.com/kuzzleio/kourou/commit/ba8493be80aa21436abc3508720d0040aedb4209))
* ci is passing locally ([216acb8](https://github.com/kuzzleio/kourou/commit/216acb87d581aaadbf47c71942e4d275a41db280))
* doctor.ts type error ([d2122ce](https://github.com/kuzzleio/kourou/commit/d2122ce6aa0eab2e780843a0287f106b3fba3b07))
* impersonate test ([29f0e2f](https://github.com/kuzzleio/kourou/commit/29f0e2f78d08d29cd11c2b57db1f0da1de41eff9))
* It should now use the proper GH_TOKEN ([6b4b949](https://github.com/kuzzleio/kourou/commit/6b4b949b7f1c4e5564174bc9cc5d505c850c16ed))
* Remove --omit=dev in release ([294ed81](https://github.com/kuzzleio/kourou/commit/294ed81b2f9d11cbbd6716823c2b69d2924f5acd))
* return a unique color for each pod in the PaaS logs ([efaeb41](https://github.com/kuzzleio/kourou/commit/efaeb41a56a5347c06bead6413acb97cd4f5cedd))
* scaffold command should delete .git folder ([f83717b](https://github.com/kuzzleio/kourou/commit/f83717bb7c7be8ff6fe481127af1d563b12806ac))
* semantic release file had the wrong name ([5acf769](https://github.com/kuzzleio/kourou/commit/5acf769ff8daf0d3d775aa61379594fcd4d40c49))
* working tests ([09a166d](https://github.com/kuzzleio/kourou/commit/09a166d34bee56023badcd0e2feda0a6e64ad1b8))


### Features

* add command for dumping an Elasticsearch instance in the PaaS ([935f210](https://github.com/kuzzleio/kourou/commit/935f21006681fe62481ebf01bfafed57f87e9b5d))
* add flag to the PaaS ES dump command to configure the document batch size ([edd3440](https://github.com/kuzzleio/kourou/commit/edd34404bc0aa9571a411604fbe14c40e9cf65b4))
* add nicer result logs for PaaS snapshot commands ([#207](https://github.com/kuzzleio/kourou/issues/207)) ([937c921](https://github.com/kuzzleio/kourou/commit/937c921929c4f4d0add02c75547900ccec9f210e))
* Add semantic release ([633e242](https://github.com/kuzzleio/kourou/commit/633e242d2bbf1c5e136dd7412c89325742e3e1e8))
* check the batch size ([0c64151](https://github.com/kuzzleio/kourou/commit/0c64151bd6b46abaa9ae73fd26704aee5061dfc2))
* implement PaaS logs follow ([757baf7](https://github.com/kuzzleio/kourou/commit/757baf7eddd9554155b97f1e6d72233116aca133))
* implement streamed HTTP queries ([481c202](https://github.com/kuzzleio/kourou/commit/481c20239d20dd5934982f0fb638d259a63786c1))
* **paas:** Update paas snapshot api call ([a103dd4](https://github.com/kuzzleio/kourou/commit/a103dd4215b5a1c5a62ed31c5e036d0beba293cf))
* retrieve the PaaS logs using a streamed query ([d0ffd6e](https://github.com/kuzzleio/kourou/commit/d0ffd6ebe983e46e4e18e03fd3cdddbf4cd86949))
* store dumped PaaS ES documents in a single JSONL file ([8b0cd2c](https://github.com/kuzzleio/kourou/commit/8b0cd2ce18c75f7c6db0737a5d7c2892721c0e42))
* support changing the NPM registry hostname ([fc4346e](https://github.com/kuzzleio/kourou/commit/fc4346e03a5f5ba603ad43ad0209e92552f2c24e))
* support displaying PaaS logs timestamps ([89e4138](https://github.com/kuzzleio/kourou/commit/89e4138ad2458570c1d5c77ee3588b41798122e5))
* support limiting the PaaS logs amount ([3247ea1](https://github.com/kuzzleio/kourou/commit/3247ea117a5bfa3a5ca38f14a608d46855ebe7a4))
* support selecting which pod to get PaaS logs from ([3647eb5](https://github.com/kuzzleio/kourou/commit/3647eb52717020eee330841251cf750a2d687c5a))
* support specifying a starting time for PaaS logs ([657aa8f](https://github.com/kuzzleio/kourou/commit/657aa8fd16af78a850606660ca07c83be6fab292))
* support specifying an ending time for PaaS logs ([95d7018](https://github.com/kuzzleio/kourou/commit/95d7018d67f66eb3980e6d932b5b80484929afd2))
