export interface RuleRef {
    name: string
    href?: string
    value?: string
}

export interface Index {
    rules: {
        [key: string]: RuleRef
    }
}


export class Storage {

    indexKey: string
    index: Index

    constructor(indexKey: string, index: Index) {
        this.indexKey = indexKey;
        this.index = index
    }

    static loadFromLocalStorage(indexKey: string) {
        const rawIndex = localStorage.getItem(indexKey)
        if (rawIndex) {
            return new Storage(indexKey, JSON.parse(rawIndex))
        }
        return new Storage(indexKey, { rules: {} })
    }

    static async loadFromServer(indexHref: string) {
        const res = await fetch(indexHref)
        if (res.status === 200) {
            const index: Index = await res.json()
            return new Storage("server", index)
        }
        throw Error("No index found")
    }

    saveToLocalStorage() {
        console.dir(this.index)
        localStorage.setItem(this.indexKey, JSON.stringify(this.index))
    }

    get(key: string) {
        if (this.index.rules[key]) {
            return this.index.rules[key]
        }
    }

    set(ruleRef: RuleRef) {
        this.index.rules[ruleRef.name] = ruleRef
    }

    add(ruleRef: RuleRef, ensure = false) {
        if (this.index.rules[ruleRef.name]) {
            if (ensure) throw Error("Rule already exists")
            return
        }
        this.index.rules[ruleRef.name] = ruleRef
    }

    *iterator() {
        for (const ruleRef of Object.values(this.index.rules)) {
            yield ruleRef
        }
    }

}