# redux-with-domain

<div align="center">

 ![CI](https://github.com/ProtoTeam/redux-with-domain/workflows/CI/badge.svg)
  [![Coverage Status](https://coveralls.io/repos/github/ProtoTeam/redux-with-domain/badge.svg?branch=master)](https://coveralls.io/github/ProtoTeam/redux-with-domain?branch=master) 
  [![NPM Package](https://img.shields.io/npm/v/redux-with-domain.svg)](https://www.npmjs.com/package/redux-with-domain) 

![](https://img.shields.io/badge/language-TypeScript-red.svg)
![](https://img.shields.io/badge/license-MIT-000000.svg)

</div>

--------------------

## 背景

一个从蚂蚁数据平台孵化出的前端 SPA 框架，她专为开发复杂 web 应用而生。
在蚂蚁内部，我们喜欢叫她 KOP（King Of Prediction），而在外部，我们将其命名为 redux-with-domain，这样更能见名知意一些。

## 设计理念

1. 领域驱动设计
    领域驱动是为了提升架构的稳定性，在展开之前，先介绍一下概念：

    1. 领域即应用软件的问题域，问题域一旦确定，边界与最优解随之确定。
    2. 领域知识即业务流程与规则。
    3. 而领域模型则是对领域知识的严格组织和选择性的抽象。

    在传统的前端开发流程中，前端和业务之间是通过视觉稿来联系的，一个需求对应一个视觉稿，视觉稿的变更即代表了需求的变更，随之带来大量的修改成本，像组件UI，业务逻辑和状态管理等，在这种模式下存在 2 个问题：
    - 视觉稿与真实的业务诉求存在偏差，开发者没法理解真实的业务需求，很难触及用户的真实痛点
    - 见山便是山的开发方式，很难沉淀出稳定的功能结构，容易产生历史包袱，从而复杂度不易收敛
    
    而领域驱动设计的开发流程，会先由业务专家和开发团队根据领域知识与业务期望从问题域中抽象出稳定的领域模型，
    因为领域模型是现实世界中业务的映射，所以天然与UI无关。
    有了稳定的模型，再去搭建上层的业务逻辑，不易受到需求的冲击。
    而这时，组件层只需实现视觉稿与和组装业务逻辑，可以有很高的灵活性。
    并且因为数据层与逻辑层的稳定，多端适配和数据同步的问题也很容易得到解决。

2. 状态分层
    状态分层为了解决 3 类问题：
    1. view ：视图组件不再通用，出现大量雷同的组件，复用性降低
    2. state ：redux体系下随着迭代的进行，中间状态不断膨胀，导致复杂度无法收敛
    3. control： 业务逻辑分散，随着人员更替，模块定位不再清晰，模块边界逐渐模糊
    
    通过区分视图状态和数据状态，由 page Module 负责页面级别的状态，承担组装与调度功能模块的职责，contianer Module 聚焦于功能模块内部的状态管理，而 domain Module 则单独处理业务数据的状态，通过分层的拆解，页面整体的复杂度不会再随迭代的进行而膨胀。

## demos
基于 BI 为原型开发的 redux-with-domain 例子。演示了如何使用 redux-with-domain 解决复杂前端项目的架构问题。
[simple-BI](./examples/simple-BI)

## License
[MIT](https://tldrlegal.com/license/mit-license)
