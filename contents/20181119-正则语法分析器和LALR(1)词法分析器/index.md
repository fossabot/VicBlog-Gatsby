---
id: "lexer-lalr1parser"
date: '2018/11/19 13:37'
title: "正则语法分析器和LALR(1)词法分析器"
lang: cn
tags:
  - compiling
  - in-class
---

# 0. 说明

这是一个编译原理课的大作业，我自己实现了一个正则语法分析器（从输入字符流到Token序列）和LALR(1)语法分析器（Token序列到规约产生式序列）。以下是说明文档。

项目是放在一个repo的子文件夹里的，目录是：https://github.com/viccrubs/Homework/tree/master/Compiler/CompilerLab

# 编译原理实验报告

# 1. 目标

实现一个**能解析正则表达式和一些扩展语法的通用词法分析器**，和**使用LALR(1)进行语法分析的语法分析器**，并定义一个能够以上提到的分析器所解析的词法定义文件（`.myl`）和语法定义文件（`.myy`）的格式，并能够做到通过在系统指定的可用Token集合上，从用户给定的**词法定义文件**和**语法定义文件**，实现从**输入文件**到**产生式规约序列**的全过程。

# 2. 内容描述

本实验提供了以下内容：

- 一个Intellij IDEA格式的Java项目，包含了目标中提到的**词法分析器**、**语法分析器**以及对应分析器的一些测例。

- 能被分析器所解析的词法定义文件（`.myl`）和语法定义文件（`.myy`）的格式描述

- 以龙书上例题4.31为依据的输入文件、输出文件、myl词法定义文件和myy语法定义文件，并提供了对应的测例

- 一个C语言子集的输入文件、输出文件、myl词法定义文件和myy语法定义文件。同时还提供了与其中myl和myy等价的flex/bison定义文件以及对应的一些工具程序。提供的词法定义和语法定义已经经过flex和bison测试可以完整无错误的解析提供的输入文件。

## 2.1 词法定义文件格式myl

一个myl包含数个以下格式的词法定义，每个定义之间可接受任意个数的空行。

```
第一行：正则表达式的字符串
第二行：对应的TokenType的字符串
```

其中，正则表达式支持以下元素：

- 字符字面量
- 闭包（*）
- 并集（|）
- 覆写优先级的括号（(, )）
- escaped字符(\n, \t, \b，\", \ (空格，表示一个空格), \\+, \\*, \\(, \\), \r)

扩展支持：

- **方括号([])**

方括号内部出现的元素之间会通过并集|连接，可与字符类配套使用。

例如：[ac\n]等价于(a|c|\n)

- **字符类（-），只能出现在方括号中**

在ASCII表中，-前面的符号和后面的符号之间的所有符号会通过并集|连接。

例如：[a-d]等价于(a|b|c|d)

例如：[\n\ba-d_]等价于(\n|\b|(a|b|c|d)|_)

示例：

```
\+
PLUS （定义一个正则表达式为\+，对应到PLUS类型的Token的匹配规则，）

\*
STAR（定义一个正则表达式为\*，对应到STAR类型的token的匹配规则）

\(
LEFT_PARENTHESIS

\)
RIGHT_PARENTHESIS

[a-zA-Z]([0-9a-zA-Z_])*
IDENTIFIER （定义一个正则表达式为[a-zA-Z]([0-9a-zA-Z_])*（即以字母开头，后面跟任意个数的数字、字母或下划线），对应到IDENTIFIER类型的token转换规则）

[\ \n\r]
IGNORED （定义空格、空行或\r字符都被匹配到IGNORED类型的token的转换规则）
```


## 2.2 语法分析文件格式myy

一个myy文件以一个字符串（代表此产生式列表的开始符，这个开始符可多次出现在产生式的左边）占一行开始，接下来由数个以下格式的语法定义组成，每个语法定义代表**一系列具有相同左侧符号的产生式的集合**，每个定义之间可接受任意个数的空行。

```
第一行：一个字符串，代表本产生式集合左边的符号

第二行开始：每一行代表一个产生式的右侧的符号列表。每个符号之间用任意个数的空格隔开。若一行为空，则代表这是一个epsilon产生式。若一个符号包含在TokenType列表里，则这个符号会被认为是一个终结符

本集合最后一个产生式后一行：符号"%"
```

示例：

```
E （代表这个产生式列表的开始符为E）


E （定义这个产生式集合的左侧符号为E）
E PLUS T （定义一个E -> E PLUS T的产生式，PLUS是一个类型为PLUS的终结符）
T （定义一个E -> T的产生式）
% （以E为左侧的产生式集合定义完毕）


T （定义这个产生式集合的左侧符号为T）
T STAR F （定义一个F -> T STAR F的产生式，STAR是一个类型为STAR的终结符）
F （定义一个T -> F的产生式）
% （以T为左侧的产生式集合定义完毕）

F （定义这个产生式集合的左侧符号为F）
LEFT_PARENTHESIS E RIGHT_PARENTHESIS （定义一个F -> LEFT_PARENTHESIS E RIGHT_PARENTHESIS的产生式，LEFT_PARENTHESIS和RIGHT_PARENTHESIS是终结符）
IDENTIFIER （定义一个F -> IDENTIFIER的产生式）
    （定义一个F -> epsilon的epsilon产生式）
% （以F为左侧的产生式集合定义完毕）
```

# 3. 实现方法

词法定义 --> 词法DFA

语法定义 --> 语法LALR(1) DFA

输入文件 --词法DFA--> Token序列 --语法LALR(1) DFA--> 规约产生式列表

其中，**词法分析器每读取一个到一个Token即暂停对输入字符的读取，转发给语法分析器进行语法分析；当语法分析器需要更多Token的时候，词法分析才继续对输入字符的读取**，并不是首先生成所有的Token，再一次性交给语法LRDFA进行语法分析。


# 4. 假设

项目中假设只会用到以下类型的Token。若需要更多类型的Token，可在`lex.internal.token.TokenType`枚举类型下增加更多的Token类型。

注意，在产生式中出现Token类型列表所包含的字符串，将被认为是对应类型的终结符。字面量仅用于调试和错误报告中。

| Token类型 | 字面量 | 备注 |
| -- | -- | -- |
| VOID | void | |
| INT | int | |
| RETURN | return | |
| WHILE | while | |
| IF | if | |
| ELSE | else | |
| ELLIPSIS | ... | |
| EQUAL | == | |
| ASSIGN | = | |
| SEMICOLON | ; | |
| STAR | * | |
| OR_OR | || | |
| LEFT_BRACE | { | |
| RIGHT_BRACE | } | |
| LEFT_PARENTHESIS | ) | |
| RIGHT_PARENTHESIS | ) | |
| COMMA | , | |
| PLUS | + | |
| MINUS | - | |
| DIV | / | |
| INC | ++ | |
| LT | < | |
| LE | <= | |
| IDENTIFIER | id | |
| INT_CONST | int_const | |
| STR_CONST | str_const | |
| IGNORED |  | IGNORED类型的token将不会传送给语法分析器 |
| DOLLAR_R | $R | 当词法分析器结束了所有的读取时，语法分析器无法获得下一个Token，则语法分析器会认为下一个Token是$R |
| UNKNOWN | # | 若词法分析器分析到UNKNOWN类型的Token，将会抛出LexicalParseException | |
| EOF | $eof | 词法分析器结束了所有的读取时，将会返回$eof类型的Token |


# 5. 重要数据结构的描述

## 5.1 词法分析器

词法分析器设计到的数据结构有DFA, DFANode, NFA, NFANode, Regex, RegexNode和Rule。

### 5.1.1 Regex和RegexNode

Regex顾名思义代表一个正则表达式，一个Regex是由一个RegexNode的列表所组成的。

一个RegexNode代表一个**正则表达式的符号**，其中**正则表达式的符号**即为正则表达式标准定义中的集几种组成元素，包括以下几种类型：

- 普通字符（包括escaped字符）
- 闭包（*）
- 并集（|）
- 连接（·）
- 覆盖优先级（(, )）

每个RegexNode都存储了这个**RegexNode的类型**和**它的字面量值**，以及**其对应的优先级**。优先级仅用于连接和并集的优先级选择上，其中连接的连接的优先级高于闭包。这个优先级将会在**正则表达式中缀转后缀**的过程中起作用。

RegexNode通过lombok生成了`equals`和`hashCode`方法，以方便比较两个RegexNode的相等性。两个RegexNode相等当且仅当两个Regex具有相同的类型且具有相同的字面量值。

### 5.1.2 NFA和NFANode

NFA顾名思义代表一个对于一个**正则表达式**的NFA。本系统里的NFA是根据Thompson算法做出来的，而通过Thompson算法做出的**对于一个正则表达式的NFA只有一个结束状态**，故本系统中一个NFA是由代表开始状态的NFANode和一个代表结束状态的NFANode组成的。

NFANode代表一个NFA中的节点，或者说一个NFA的状态。一个NFANode是由一个**以自己为出发边的边的集合**和**对应的正则表达式所对应的token类型**所组成的。

前者（以自己为出发边的边的集合）在Java中的表示形式为`Map<Character, List<NFANode>>`，其key代表边上的字符，value代表通过key字符能够达到的状态的集合。

后者（对应的正则表达式所对应的token类型）对应**在词法定义文件中，满足此正则表达式的字符串应该被语法分析及其后续过程认为的Token的类型**。

NFA的边集没有单独保存，而是通过每个NFANode的**以自己为出发边的边的集合**表示。

### 5.1.3 DFA和DFANode

DFA顾名思义代表一个对于一份**词法定义文件**的DFA，由一个标志开始状态的DFANode和这个DFA所有的接受状态的列表组成。本系统里DFA是以下算法得到的：

1. 分析**词法定义文件**中所有的正则表达式，得到NFA
2. 新增一个开始状态，将这个开始状态和所有NFA的开始状态通过epsilon边相连接
3. 使用**子集构造算法**得到DFA。

DFANode代表一个DFA中的节点，或者说一个DFA的状态。一个DFANode是由**它所对应的NFA状态的集合**、**以自己为出发边的边的集合**和**自己所对应的所有可能的token类型的集合**所组成的。

第一项（所对应的NFA状态的集合）即在子集构造算法中，构成这个DFA状态的NFANode的集合。

第二项（以自己的为出发边的边的集合）在Java中的表示形式为`Map<Character, List<NFANode>>`，其key代表边上的字符，value代表通过key字符能够达到的状态的集合。

第三项（自己所对应的所有可能的token类型的集合）即这个DFA状态对应的NFANode所**对应的正则表达式所对应的token类型**的并集。“这个DFA所对应的NFA状态的集合中包括至少一个结束状态的NFANode”是“DFANode所对应的所有可能的token类型的集合非空”的充要条件。通过保存这个集合能够减少词法分析的时间。

DFA的边集没有单独保存，而是通过每个DFANode的**以自己为出发边的边的集合**表示。

DFANode重写了equals方法。两个DFANode相等当且仅当两个DFANode具有相同的**自己所对应的所有可能的token类型的集合**。虽然NFANode并没有重写equals方法，但是在算法过程中**保证了没有新的NFANode产生**，保证了两个NFANode相等当且仅当它们是同一个对象。

### 5.1.4 Rule

一个Rule代表词法定义文件中定义的转换规则，由**一个正则表达式的字符串**和**对应的Token类型**组成。它仅被用于表示用户的词法定义。


## 5.2 语法分析器

语法分析器用到的数据结构有Symbol, Production, ProductionList, LRItem, LRDFA, LRDFANode。

### 5.2.1 Symbol

Symbol（符号）是语法分析过程的基本单位，有两个属性组成：代表**非终结符名称的ntName**和**代表终结符Token类型的tokenType**。一个符号要么是一个**非终结符**（`nt != null && tokenType == null`），要么是一个**终结符**（`nt == null && tokenType != null`）。通过调用`Symbol.terminal(TokenType)`或者`Symbol.nonterminal(String)`可以分别产生一个终结符或者非终结符实例。

Symbol实现了equals和hashCode方法，两个Symbol相等当且仅当（两个Symbol都是非终结符 && 两个Symbol的非终结符名称相同） || (两个Symbol都是终结符 && 两个Symbol的终结符Token类型相同)。实现hashCode方法允许了将其作为HashMap的Key值，简化了后续的编程。这两个方法都是由lombok实现的。

### 5.2.2 Production

Production代表一个产生式，由**产生式左边的符号(left)**和**产生式右边的符号列表(right)**组成。当产生式右边的符号列表为空的时候，代表这是一个epsilon产生式。

Production实现了equals和hashCode方法。两个Production相等当且仅当两个产生式具有相同的**产生式左边的符号**和**产生式右边的符号列表（包括顺序）**。实现hashCode方法允许了将其作为HashMap的Key值，简化了后续的编程。这两个方法都是由lombok实现的。

### 5.2.3 ProductionList

一个ProductionList代表一个产生式列表，一个ProductionList只允许有一个左边是开始符的产生式。所以，一个产生式列表由**产生式的列表**，**初始产生式(startProduction），即左边是开始符的唯一的产生式**和**开始符（startSymbol）**组成。

为了简化编程，一个ProductionList还提供了计算函数`First(Symbol)`以计算一个符号的First函数值，和`canDeriveToEpsilon(Symbol)`以判断一个符号是否能推出epsilon表达式。为了减少计算时间，这两个函数将会在计算出一个Symbol的结果后，将其结果记录到一个Map中（firstMemo和canDeriveToEpsilonMemo），下次再进行相同的符号的时候，函数将直接从对应的map中直接取值。

### 5.2.4 LRItem

一个LRItem代表一个LR项，由**对应产生式(production)**、**点的位置(dotPosition)**和**向前看符号(lookaheadSymbol)**组成。根据向前看符号是否为null，一个LRItem可能是一个LR(0)项（`lookaheadSymbol == null`），也可能是一个LALR(1)项（`lookaheadSymbol != null`）。

LRItem实现了equals和hashCode方法。两个LRItem相等当且仅当两个LRItem具有相同的**对应产生式**，**点的位置**和**向前看符号**。实现hashCode方法允许了将其作为HashMap的Key值，简化了后续的编程。这两个方法都是由lombok实现的。

### 5.2.5 LRDFA和LRDFANode

LRDFANode代表一个LR自动机中的一个状态，由**代表这个状态的内核(kernel)的LR项（LRItem）的集合**、**组成整个状态的LR项的集合**和**以自己为出发边的边的集合**组成。其中，**以自己为出发边的边的集合**在Java中的表示形式为`Map<Character, List<LRDFANode>>`，其key代表边上的字符，value代表通过key字符能够达到的状态的集合。根据组成其的LR项的类型（LR(0)项或者LALR(1)项），这个LRDFANode可能是LR(0)自动机或者LALR(1)自动机的一个状态。

LRDFANode重写了equals和hashCode方法。两个LRDFANode相等当且仅当它们具有相同的内核。实现hashCode方法允许了将其作为HashMap的Key值，简化了后续的编程。

一个LRDFA代表一个LR确定自动机，由**开始状态(startState)**、**结束状态列表(endStates)**和**所有状态列表(allNodes)**组成。根据其中包含的状态的类型（LR(0)或者LALR(1)），这个自动机可能是LR(0)自动机或者LALR(1)自动机。

# 6. 重要算法描述

### 6.2 构建词法分析DFA

### 6.2.1 词法定义文件 到 转换规则(Rule)集合

对应的方法：`lex.MylexReader.read`

首先去掉忽略所有空格行，读到非空格行第一行认为是正则表达式，第二行认为是Token，调用TokenType.valueOf将字符串转换为TokenType。循环这个过程直到输入结束。

### 6.2.2 转换规则 到 NFA

对应的方法：`lex.internal.NFA.constructNFA`

此过程分为4个子过程：**正则表达式字符串预处理**，**加入点符号**，**中缀正则表达式转后缀**和**后缀正则表达式转NFA**。

#### 6.2.2.1 正则表达式字符串预处理

对应的方法：`lex.internal.Regex.preprocess`

预处理过程会将中括号和字符类的符号转换为只包含字符、*、|和()的标准正则表达式，并将**字符串**转换为**RegexNode的列表**。具体转换规则如下：

1. 遇到左中括号，记录下目前已经进入中括号，并将加入左括号类型的RegexNode。
2. 遇到-字符，获得-前面的RegexNode，再获得之后的一个RegexNode，取得两个字符的ascii码之间的所有字符，通过|连接所有的字符，再在前面和后面各加一个圆括号
3. 遇到\\字符，读取后面一个字符，将查找escapedChar表，将对应的escaped后的字符加入列表。
4. 遇到右中括号，记录已经出了中括号，并加入右括号类型的RegexNode
5. 遇到其他字符，将其字面量的CHAR类型的RegexNode加入列表
6. 最后，如果仍然处于中括号之中，在后面加一个OR（|）的RegexNode
7. 回到步骤1，直到没有下一个输入字符

#### 6.2.2.2 在RegexNode列表中加入点符号

对应的方法：`lex.internal.Regex.addConcatenation`

遍历预处理后的RegexNode列表，在满足以下条件的两个符号之间加入点符号，表示这是两个正则表达式相连接的而构成的。

- 左侧符号：是上一个正则表达式的结束 <==> 左侧符号是*, )或者一个普通字符
- 右侧符号：是下一个正则表达式的开始 <==> 右侧符号是(或者一个普通字符

#### 6.2.2.3 中缀正则表达式转后缀

对应的方法：`lex.internal.Regex.toPostfix`

将加入点符号的RegexNode列表转换为后缀表达式，其中

- *是一元运算符，具有最高优先级
- 连接（点）的优先级高于或（|）

#### 6.2.2.4 后缀正则表达式转NFA

对应的方法：`lex.internal.NFA.constructNFA`

使用Thompson算法，将一个后缀正则表达式转换为一个NFA。其中，每个后缀正则表达式的结束状态的**对应的正则表达式所对应的token类型**被设置为对应转换规则所规定的Token类型，非结束状态的状态的**对应的正则表达式所对应的token类型**为null。

### 6.2.3 所有转换规则对应的NFA --> 一个lNFA

对应的方法：`lex.LexicalAnalyzer.constructDFA，43-53`

得到所有转换规则的正则表达式的NFA后，新增一个开始状态，将这个开始状态用**epsilon边连接**到所有NFA的开始状态，得到一个lNFA。

### 6.2.4 lNFA --子集构建算法--> 词法DFA

对应的方法：`lex.internal.DFA.constructDFA`

使用子集构造算法（龙书图3-29，算法3.20），将lNFA转换为对应的DFA。其中每个DFA状态（DFANode）**自己所对应的所有可能的token类型的集合**包含组成这个DFANode的NFANode的**对应的正则表达式所对应的token类型**的并集。构建出来的DFA被称作词法DFA，是后续进行词法分析的核心组件。

子集构造算法中使用的**epsilon闭包的计算**算法为龙书图3-30。

## 6.3 构建LRDFA

### 6.3.1 语法定义 ---> 产生式列表

对应的方法：`syntax.MyYaccReader.read`

首先忽略带开头的所有空行，读到第一个字符串被认为是整个产生式列表的开始符。继续往后读，重复一下步骤直到没有进一步的输入：

1. 读取到的第一个非空行的字符串，认为其为本产生式的列表的公共的左边的符号
2. 往后读取每一行，将每一行认为成一个新的产生式，其左边是在上一步记录下的公共左边的符号。将每一行的内容使用空格作分割，对一行中的每个字符串，首先查找其是否在TokenType中出现过。若出现过，则认为这个字符串是一个非终结符；否则，认为这个字符串是一个终结符。将这个符号加入这个产生式的右边的符号的集合。若这一行的内容为空，那么认为这个产生式是一个epsilon产生式，使其右侧符号列表为空。
3. 重复第2步，直到读取到一个%，表明本产生式的列表读取结束。
4. 回到第1步，直到输入结束。

最后，调用ProductionList.fromUnaugmentedList方法，给整个产生式列表加入一个新的开始符`S'`和新的初始产生式`S' -> {原开始符}`。

### 6.3.2 产生式列表 ----> LR(0)自动机

对应的方法：`syntax.constructLR0DFA`

#### 6.3.2.1 计算一个LR项的集合的闭包
对应的方法：`syntax.internal.LRDFA.closure`

采用书上图4-32所采用的CLOSURE的计算方法。为了提高效率，会使用一个栈来保存还没有进行状态内扩展的项。在函数刚进入的时候，内核的所有项将会入栈；在每次执行算法的时候，会弹出栈顶，在这个过程中新产生的LR项将会入栈；当栈为空的时候，说明没有可以继续进行状态内扩展的LR项，表明闭包构建完成。

注意，在闭包构建过程中会产生新的LRItem对象。由于LRItem对象重写了equals方法，所以这些新产生的LRItem对象和之前可能已经存在LRItem对象无异。

注意，若输入的LR项存在向前看符号（即为LALR(1)项），设为(A -> a.Bc, d)_，则将会计算First(cd)，并将这些向前看符号加入到LRItem对象中。

#### 6.3.2.2 LR(0)自动机构建

对应的方法：`syntax.constructLR0DFA`

1. 通过产生式列表，获得初始产生式，构建第一个LR(0)项 S' -> .S，将其加入结果集和栈
2. 重复以下过程，直到栈为空：
    1. 弹出栈顶的LR(0)项
    2. 对每个以这个LR(0)项为出发边的所有边上的符号S：
        1. 将这个LR(0)项移点，将得到的LR(0)项加入集合中
        2. 以这个集合为内核，构建闭包，作为新的状态
        3. 将这个状态和上一个LR(0)项使用符号为S的边连接起来
3. 到现在，已经获得了LR(0) DFA的所有状态，即已经获得了LR(0) DFA。


### 6.3.3 LR(0)自动机 ----> LALR(1)自动机

对应算法：`syntax.addLookaheadSymbol`

#### 6.3.2.1 First(Symbol)和一个符号是否能够推出epsilon的计算

在这个算法中需要用到First函数，以及判断一个符号是否能够推出epsilon。由于它们仅依赖**产生式列表**，为了方便代码的维护以及设计缓存增加计算效率，所以这两个方法都写在ProductionList作为它们的实例方法。

判断一个符号是否能推出epsilon：`syntax.internal.ProductionList.canDeriveToEpsilon`

1. 若输入符号是一个终结符，那么它不能推出epsilon。在我们程序中，不会存在EPSILON终结符。
2. 若输入符号不是一个终结符，遍历所有以它为左边符号的产生式P：
    1. 若P的右侧符号列表为空（即推出epsilon），或者右边的所有符号都能推出epsilon，则断定输入符号可以返回epsilon，算法结束。
3. 若以上循环结束后，算法仍然没有结束，说明不存在一个可以让输入符号推出epsilon的产生式，断定输入符号不能返回epsilon，算法结束。


First算法：`syntax.internal.ProductionList.first`

1. 若输入符号是一个终结符，那么它的First集合就是以它本身为唯一元素的集合。在我们程序中，不会存在EPSILON终结符。
2. 若输入符号(L)不是一个终结符，遍历所有以它为左边符号的产生式P：
    1. 对产生式P的右边符号列表中的每个右边符号R:
        1. 如果R.equals(L)，为了避免无穷递归，忽略这个符号，继续循环
        2. 将first(R)中的所有元素加入first(L)
        3. 若R不能推到epsilon，则退出循环；否则，继续循环
3. 返回first(L)

#### 6.3.2.2 对LR(0)项加上向前看符号

使用书上算法4.47（自生成-传播算法），将LR(0)自动机中的所有状态中的所有LR项**加上向前看符号**（lookahead symbol），构建LALR(1)自动机。

对应算法：`syntax.addLookaheadSymbol`

首先定义一个新的数据结构`StateSpecificLRItem`，保存一个LRDFANode项和LRItem项，用于记录一个LRItem项及其它所属的LRDFANode。

1. 初始化两个Map
    - propagateMap，类型为`<StateSpecificLRItem, List<StateSpecificLRItem>>`，用于记录向前看符号的传播路径。在这个Map中，Key所拥有的向前看符号都会最终传播给它的Value中的所有LR项。
    - resultLookaheadsSymbolMap，类型为`Map<StateSpecificLRItem, List<Symbol>>`，用于记录每对一个LR项，它通过自生成或者传播所得到的所有向前看符号的集合。
2. 在resultLookaheadsSymbolMap中，对S' -> .S项加入一个自生成的向前看符号$R。
3. 根据书上算法4.46，确定向前看符号的传播路径，以及所有自生成的符号。这个步骤结束后，向前看符号传播路径Map已经被初始化结束（例：龙书图4-46），resultLookaheadsSymbolMap中，自生成的向前看符号的也已经被加入对应LRItem的值的集合中。
4. 根据算法4.47，将所有自生成符号加到resultLookaheadSymbolMap对应的LR项的值的集合中。到这个步骤结束后，resultLookaheadSymbolMap中的每一项，其Key集为一个输入LR(0)自动机的所有状态的所有LR项的集合，每个key的Value为这个LR项所有的向前看符号。
5. 根据StateSpecificLRItem中记录的这个LR项所对应的LRDFANode状态，将这些向前看符号加到这个LR项上，加入回原来的LRDFANode项中。为了保持LRDFANode所记录的边的目标状态仍然有效，这里将会直接修改原LRDFANode所持有的内核集合和状态集合（而不是产生一个新的LRDFANode）。
6. 算法结束。原有的LR(0)已经成为了一个LALR(1)自动机。

## 6.4 词法分析：输入文件 --> Token

对应方法：`lex.LexicalAnalyzer.next`

这个过程实现了最长匹配。在这个过程中，一旦返回Token，词法分析暂停，等待语法分析程序需要更多的Token时再继续分析。

在分析之前，已经通过输入的词法定义文件获得了对应的DFA。

1. 初始化当前状态为DFA的开始状态，初始化读到的字符串为""。
2. 循环以下步骤，直到输入结束：
    1. 读取一个字符c
    2. 如果存在一条以当前状态为开始状态，c符号为边上的符号的边（说明还存在能够匹配更多字符的目标状态）：
        1. 将开始状态设为这条边的目标状态
        2. 将读到的字符串加上字符c
        3. 继续循环
    3. 不存在，匹配结束，尝试返回目前读入的字符串所对应的Token类型
        1. 将输入字符放回输入流
        2. 如果当前状态是一个结束状态：
            1. 获得当前状态对应的所有可能的Token类型
            2. 若唯一可能的类型是UNKNOWN，报词法错；否则，返回以列表中第一个Token类型为类型，读到的字符串为字面量的Token。
        3. 若当前状态不是一个结束状态，报**期望更多正确输入字符**的词法错
3. 输入结束，若当前状态是结束状态，则返回当前结束状态对应的Token类型列表的第一项。
4. 若不是结束状态，则判断当前读到的字符串是否为空串：若是，说明输入流已经结束，返回一个EOF类型的Token；否则，报**期望更多输入字符**的词法错误。

### 6.5 语法分析：Token序列 --> 规约产生式序列

对应方法：`syntax.SyntaxAnalyzer.getProductionSequence`

这个过程通过输入Token序列流，能够返回所有使用到的规约产生式序列。

这个过程没有像书上一样采用LALR(1)分析表实现，而是直接通过使用LALR(1) DFA来进行分析，其核心理念是相同的（移入-规约），核心算法几乎一致（书上算法4.30），而且LALR(1)分析表也是通过LALR(1) DFA获得的。直接使用LALR(1)方便编程。

1. 初始化产生式序列，状态栈和符号栈。
2. 加入LALR(1) DFA的初始状态到状态栈中。
3. 令symbol为第一个输入符号。输入符号一定是非终结符，语法分析器每要求一个输入符号，词法分析器就会进行词法分析，第一个非IGNORED类型的Token的TokenType将会提供给语法分析器。
4. 无限循环以下步骤：
    1. 获得组成当前状态的所有LALR(1)项中的可规约项，其向前看符号为symbol。若有多个这样的可规约项（**等同于分析表对应格子中同时存在多个ri项**），报**规约-规约冲突**错误。语法分析结束。
    2. 获得以当前状态栈顶为开始状态，symbol为边上符号的边的目标状态targetState。
    3. 若同时存在targetState和可规约项（**等同于分析表对应格子中同时存在si, rj项**），报**移项-规约冲突**错误，语法分析结束。
    4. 若两项同时不存在（**等同于分析表对应格子为空**），报**意外的token错误**，语法分析结束。
    5. 若targetState == null，即目前应该进行规约操作（**等同于分析表中遇到ri项**），设可规约项为(P, s)：
        1. 若P为S' -> S·，说明这是接受状态。语法分析结束。
        2. 将P（产生式）加入规约序列列表。
        3. 从符号栈和状态栈中pop P右侧符号个数次
        4. 将P左侧符号压入符号栈
        5. 以状态栈栈顶为开始状态，目前符号栈栈顶为边上符号，找到对应边的目标状态，将其压入状态栈
        6. 进入下一次循环
    6. 若targetState != null，即目前应该进行移项操作（**等同于状态表中遇到si项**）
        1. 将targetState压入状态栈
        2. 将symbol压入符号栈
    7. 若不存在下一个token，则设置symbol为$R；否则，设置symbol为下一个输入符号。
8. 循环结束，返回规约序列列表，语法分析结束。

# 7. 可用测试用例

## 7.1 初始化编程环境

1. 使用Jetbrains Intellij IDEA打开项目文件夹`CompilerLab`
2. 等待gradle下载依赖（本项目依赖[lombok](https://projectlombok.org/)和[junit](https://junit.org/junit4/)，使用gradle进行依赖管理）
3. 安装lombok的IDEA插件
4. 在IDEA Settings -> Build, Execution, Deployment -> Compiler -> Annotation Processors，对整个项目在右边勾选Enable Annotation Processing

## 7.2 运行以龙书例题4.31为依据的集成测试

要运行这个测试，请运行`test/java/IntegrationTest::testExample431`。这个测例将读取`main/java/resources/example4.31`下预先提供的输入文件、词法定义文件和语法分析文件，将输入文件进行词法和语法分析，得到规约序列，并与测试中写好的预期序列进行比较，得出测试结果。示例（以及确保正确的）的输出结果位于`main/java/resources/example4.31/output`中。

## 7.3 一个C语言子集的运行示例

这个C语言子集提供了flex/bison项目以及基于等价myl, myy定义文件的运行方式。

flex/bison项目中包含了这个C语言子集对应的.l和.y定义文件。要运行flex/bison项目，请参考`CSubsetFlexBison`目录下的说明文档。

与flex/bison项目中提到的C语言子集等价的词法定义文件和语法定义文件，以及和flex/bison项目中示例文件test.c完全相同的示例输入文件均位于`main/java/resources/bigtest`下。测试用例`test/java/IntegrationTest::bigTest`将读取输入文件、词法定义文件和语法分析文件，将输入文件进行词法和语法分析，**输出**规约序列。注意此“测试”由于比较复杂（规约序列中包含200余条产生式），故只提供了程序的输出信息(`main/java/resources/bigtest/output`文件)，并没有进行正确性验证。

## 7.4 单元测试

在开发过程中，单元测试起到了测试一个功能点正确性的作用。本项目中`test/java/LexTest`和`test/java/SyntaxTest`包含了编写词法和语法分析器过程中所用到的单元测试，若有兴趣，可自行运行。

# 8. 遇到的问题和解决方案

仅举几个例子。

## 8.1 计算First的时候无限递归

使用公式递归计算First函数的时候，容易遇到类似First(A) = First(A) U First(B)...的无限递归的情况。根据集合方程的特性，在这种情况下可以直接忽略右侧的First(A)，这样即可避免无穷递归的问题，成功算出函数值。

## 8.2 新对象与老对象的区分和联系

在程序运行过程中，有很多地方可能会产生与老对象有同样的值的新的对象（例如计算一个LR DFA状态的closure的过程中，会产生一些新的状态）。为了让这些新的对象能够在程序中表现得和原来的老对象一致，所以程序中重写了equals方法，这样就可以让有相同内容的新的对象和老的对象在程序中被认为是相等的，简化了判断。

另一方面，程序中有很多地方看起来需要修改现有对象（例如加入向前看符号，移点操作等），但是由于很多对象在一次计算过程中是共享的，若直接修改输入对象的内容，可能会造成不可预知的后果。所以，这些方法都实际被做成了产生新的状态（而不是直接修改现有的对象），由于这些对象都重写了equals方法，它们将会在接下来的算法中，和目前有的对象被认为是同一个对象，不会影响程序的实现。

## 8.3 不建立分析表而直接使用LALR(1) DFA进行分析

我当时考虑过建立LALR(1)分析表，但是这样会引入很多的类，以及类似`Map<State, Map<State, Action>>`这样比较拗口的类型用来表示一个二维表。后来为了简化编程，所以直接采用LALR(1) DFA状态机的形式进行分析。

# 9. 感受和评论

词法分析和语法分析是编译器最早的两个步骤，通过自己实现通用词法分析器和同于语法分析器，我更加深入地理解了正则表达式到NFA到DFA过程和从CFG到LR(0) DFA到LALR(1) DFA的全过程，也更加深入的理解了从输入文件到Token序列到产生式规约序列的全过程，对我理解词法分析和语法分析过程起到了至关重要的作用。
