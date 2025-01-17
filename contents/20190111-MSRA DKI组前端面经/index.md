---
id: "MSRA-DKI-frontend-interview-experiences"
date: "2019/01/11 23:21"
title: "MSRA DKI组前端面经"
lang: cn
tags:
  - interview-experiences
  - Microsoft

related:
  - 2019-spring-ms-intern-interview-experiences
---

# 开端

2018年年底，看到很多同学都去实习了，虽然明知不可能正大光明去，而且MSRA在北京翘课去也很有风险，但算了算三个月也还是有可能，心一横还是先让学长帮忙把简历给了MSRA内部的组，不管怎么样可以体验一次真正的面试，可以为春招做准备。因为本人现在也就web前端比较稍微熟练一点，研究啥的根本没碰过，所以本来是打算投[创新工程组](https://www.msra.cn/zh-cn/jobs/interns/ieg-development-intern-20170512?language=chinese)和[创新孵化组](https://www.msra.cn/zh-cn/jobs/interns/ard-incubation-development-intern?language=chinese)的软件开发实习生去做做前端，没想到学长给投了**DKI组（数据、知识、智能组）的**，而且DKI组根本就没有在官网公开招工程方向的实习生，只开放个[研究实习生](https://www.msra.cn/zh-cn/jobs/interns/software-analytic-group-dki-intern?language=chinese)的职位……经过一周时间的笔试和面试，**加上运气好和面试过程比较水的因素**，拿到了梦寐以求的offer，但是却因为各种原因去不了，非常遗憾，可能这也是我人生中最近微软的一次了吧。

# 笔试

元旦前发的简历，元旦后第二个工作日（星期四，2019年1月3日）就收到笔试通知了。笔试是要求根据自己对职位的选择选一个任务来做，并且**要求在1天之内提交**。

任务分2个大类：数据和算法（Data & Algorithms）和工程（R&D Engineering）。

数据和算法部分要求在**给定的数据集上做一个二分类问题**，由于本人基本不知道这方面的东西所以就不讲了。

选择工程方向的话，首先需要写一份自己的**项目经历**，详细讲一下我所做过的项目的情况，然后是在一份**前端题**和**后端题**上选一个做。

后端题是做一个**API服务，能够解析在题目中规定格式的查询请求并返回数据**。个人看了这个题感觉这个题难点应该在解析上，第一反应是要用上编译原理的知识？后来想了想可能没这么困难，一些简单的字符串分析应该就出来（就像17级软工1大作业那种）。但是反正不是我这种只会在框架上做做CRUD的人能很快做出来的（同时非常想知道为什么很多人都喜欢去投后端岗位，前段时间字节跳动的招聘听说后端40+人，前端和移动端加起来也就10人左右，感觉后端随便问问深一点的知识就凉了啊……），加上本来也是想投前端的职位，所以就选了前端题。

前端题目是在已有代码的基础上做一个**支持拖拽项目改变顺序和状态的to-do list**，基础代码提供了React和Vue两个版本的基础代码。基础代码就是一个简单的列表，需要自己在这个基础上实现之前提到的需求。这个需求本身不是很难，难点在drag & drop相关事件的处理上，但是这些不知道没关系，网上一查就知道了（[MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)），又不是闭卷。基本思想就是**在onDragStart的时候记录下被拖拽的项目，然后在每个项目的onDragOver的时候，重新计算当被拖拽的项目拖到这个位置时的列表的顺序，然后更新下dom就行**。由于我使用的react，所以直接把列表和被拖拽的项目记录在state里，更新的时候直接setState就可以了。

这里不使用onDrop而使用onDragOver的原因是需求要求**在拖拽的过程中就能看到改变顺序时的效果**。

有的同学看了API可能想到**不记录被拖到的项目，而是把项目放在dataTransfer里传递**，但是[dataTransfer是不能在onDragOver的时候访问到的](https://stackoverflow.com/questions/11065803/determine-what-is-being-dragged-from-dragenter-dragover-events)，所以必须自己记录和处理。而且需求还要求正常被拖动的项目**不能在列表中显示**，我这里耍了点小trick：被拖动的项目的color将会被设置成white，这样就达到了隐藏的效果~

前端的要求应该还是比较简单的，加上从create-react-app建项目以及最后上传，也就做了2个小时左右吧，倒是写项目经历写了五六个小时……

# 面试

笔试提交当晚，就打电话来约面试时间了。面试最终是在第二周星期一（2019年1月7日下午），通过Skype进行的。面试分了以下几个阶段：

## 前20分钟左右：算法题

题目：类似于[Leetcode 200](https://leetcode.com/problems/number-of-islands)

感受：最大的感受就三个字**运气好**！！！！因为当天上午刚做过，而且这种题目就是那种**没做过死活不会，做过就会了**的非常典型的题目（你看了就知道），写起来都是套路。和leetcode不同的一点是**输入输出要自己处理**，还好我还记得一点C++的输入输出的写法……

写完后那边还问了一个追加问题：**如果不是一次输入整个矩阵，而是要求每输入一行就输出当前输入的计算结果**。最简单的粗暴的做法当然是**完全重跑一遍**（当然不是最好的），后来在那边的启发下相处了一个稍微好一点的做法：**记录上一行的1所处岛的编号，然后遍历本行，当本行遇到一个1时，看上一行，若上一行周围3个位置只有一个1或者都是同一个岛或者左上和右上是同一个岛，那么本行的1是那个岛的一部分，结果不变；若左上和右上都是岛，但是不同的岛，说明这个1会连接这两个不同的岛，那么结果减1；如果上面都是0，说明这个岛是个新的，那么结果+1**。最后想出来还是有点不太有底，但是面试官还是非常肯定这个做法。

算法题运气实在是太好了，因为我最没底的就是算法，这次算法运气太好水过，也许下一次就挂了（嗯之前面试的另外一个组就直接挂在一面算法题……）……这也是为什么我有一种**这是我最接近MSRA的一次**的感觉，因为下一次可能运气就没这么好了……

## 10分钟：项目经历

毕竟是工程岗，做项目是比较重要的。算法题结束后，有个小姐姐要求讲一讲项目经历。我就拿着花旗杯项目狂吹，吹的我自己都有点不好意思了。小姐姐听了后就问了问一些项目一些可能改进的地方（架构改得更react一点而不是以DI为核心的类似OO的架构，加SSR等），我就稍微讲了讲我的想法。最后小姐姐问了问**React的生命周期**。这里强调一下，由于这个题比较经典，网络上有很多面经都包括了这个问题，**但是很多都是老版本的**，如果你说你会用react但是你按老版本的答案，这样会感觉你其实没有真正拿react做过东西而是在背而已。比如只要你最近用过react就知道componentWillMount在16的时候就已经deprecated了，如果你还背这个……自求多福吧。

整个过程还是比较愉快的，可能是因为项目介绍了太多太快小姐姐没听清楚……然后就换了个面试官，进入第三轮面试。

## 1个小时：项目经历和前端知识

这个感觉是前端组的大佬在问（应该是我进了后的mentor吧，唉）。首先也是问了一些项目经历，我就按照之前的讲法重复了一遍，然后就开始根据自己提到的东西问各种问题了。下面我还记得的一些问题：

1. 如何将canvas的数据和react的状态进行同步
2. 如何实现在canvas中使用鼠标拖动标记框将其移动的功能
3. 解释MobX的observable机制
4. MobX修改observable后是会立刻通知所有相关observer吗？如果不想每次都通知，有什么办法？（这个我觉得有点拿不准但是我记得是有API可以阻止MobX通知……）
5. 为什么要用MobX？（我答成和Redux的对比了……）
6. 响应式实现的方法（media query, onwindowresize...)
7. 在react中如何使用样式（style, css modules, css-in-js等）
8. 动画的问题（transition, requestAnimationFrame等，基本没答出来因为当时我就用过transition...)
9. setInterval和requestAnimationFrame（同上……只用过setInterval）
10. 长列表懒加载（我只知道这个概念，没有实现过……）
11. 一些常见的鼠标事件（onmousedown, onmouseup这些）
12. ……

总的来说，面试官问的还是挺细的，**把我会的问到不会，把不会的都问了一遍**……但是，**所有问题都是从之前讲的项目经历里找出来的**，所以建议在介绍项目经历的时候重点介绍自己熟悉的，并且讲的时候一定要结合自己的经验讲，不要死记硬背，如果你真做过对他提的绝大部分问题应该都是遇到过和比较熟悉的，一些确实不知道的也尽量把自己的思路说一下，实在不行再认输。

第三轮结束后问了下时间，整个面试就结束了，整个过程也就1个半小时左右。

# 最终和总结

星期一下午面完之后，星期三晚上就电话打过来说过了，然后准备确认下时间，正常的话一周后就可以去了……我就是在这个时候才发现这个项目是**六个月**的……当时心情就不好了，第二天挣扎之后只能拒绝告终。

总的来说，面试通过的原因：

1. 不管因为什么原因（学长内推？组内缺人？对工程方向要求没那么高？）造成的**面试和笔试都比较水**（1个半小时的面试就行了？？）
2. **算法题运气爆炸！！！**

最终没去的原因：

1. 第一当然是我自己太怂不敢直接翘课……
2. 项目要求6个月而我就算翘课也只能翘3个月
3. ~~和st说了……~~

而MSRA由于主要是对研究非常重视，所以可能相比起来工程方向的就以**实用为主**，而且它不也像互联网公司一样对用户体验要求特别高（后来询问后面找前端主要是给内部研究团队做点可视化等工作，并不需要直接面对用户），所以对一些常见的前端难点也不怎么重视（函数防抖、CSS等，之前看到一份字节跳动的前端题目心态直接爆炸），主要还是**看面试者的学习和思考能力**吧，并不是考绝对的知识量。

所以建议如下：

1. 刷题，刷题，刷题
2. 复习自己的**项目**，找出其中的亮点，并且对他们熟悉，回想起来当时这样实现的思考的过程，在面试的时候展示出一种如数家珍和自信的感觉
3. 对一些知识点不要死记硬背！！不要死记硬背！！不要死记硬背！！就算自己面试的时候不知道正确答案，也要自信地把自己的思考过程讲出来
3. ~~积累运气~~

最后祝大家都能去自己想去的地方~
