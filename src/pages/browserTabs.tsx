import { Button } from "@/components/ui/button"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export const Route = createFileRoute("/browserTabs")({
  component: RouteComponent,
})

interface Bookmark {
  href: string
  text: string
  add_date: string
  icon: string
  level: number
}

// 数据库配置
const DB_NAME = "BookmarkDB"
const STORE_NAME = "bookmarks"
const DB_VERSION = 1

// 初始化数据库
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "href" })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function RouteComponent() {
  const navigate = useNavigate()

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // 初始化加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const db = await openDB()
        const transaction = db.transaction(STORE_NAME, "readonly")
        const store = transaction.objectStore(STORE_NAME)

        const request = store.getAll()
        request.onsuccess = () => {
          setBookmarks(request.result)
          setIsLoading(false)
        }
      } catch (error) {
        console.error(error)
        toast.error("加载数据失败")
        setIsLoading(false)
      }
    }

    loadData()
  }, [])
  // 保存数据到IndexedDB
  const saveBookmarks = async (items: Bookmark[]) => {
    try {
      const db = await openDB()
      const transaction = db.transaction(STORE_NAME, "readwrite")
      const store = transaction.objectStore(STORE_NAME)

      // 清空旧数据
      store.clear()

      // 批量添加新数据
      items.forEach((item) => store.add(item))

      transaction.oncomplete = () => setBookmarks(items)
    } catch (error) {
      console.error(error)
      toast.error("保存数据失败")
    }
  }
  // 书签解析函数
  const parseBookmarks = (html: string) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    const links: Bookmark[] = []

    function scanDL(dlElement: Element, level = 0) {
      Array.from(dlElement.children).forEach((child) => {
        if (child.tagName === "DT") {
          const a = child.querySelector(":scope > A")
          if (a) {
            links.push({
              href: a.getAttribute("href") || "",
              text: a.textContent || "Untitled",
              add_date: a.getAttribute("add_date") || "",
              icon: a.getAttribute("icon") || "",
              level,
            })
          }

          const nestedDL = child.querySelector(":scope > DL")
          if (nestedDL) scanDL(nestedDL, level + 1)
        }
      })
    }

    const rootDL = doc.querySelector("DL")
    if (rootDL) scanDL(rootDL)
    return links
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "text/html") {
      toast.error("请选择有效的HTML文件")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const result = event.target?.result
        if (typeof result === "string") {
          const parsedData = parseBookmarks(result)
          setBookmarks(parsedData)
          toast.success(`成功导入 ${parsedData.length} 个书签`)
        }
      } catch (error) {
        toast.error("文件解析失败", {
          description:
            error instanceof Error ? error.message : "无效的书签文件格式",
        })
      }
    }
    reader.readAsText(file)
    e.target.value = "" // 清空输入以便重复上传
  }
  if (isLoading) {
    return <div>Loading...</div>
  }
  return (
    <div className="p-10">
      <div className="flex gap-4 mb-6 items-start">
        <div className="flex-1"></div>
        <input
          type="file"
          id="bookmarkFile"
          accept=".html"
          onChange={ handleFileUpload }
          className="hidden"
        />
        <div className="flex flex-col">
          <Button asChild>
            <label htmlFor="bookmarkFile" className="cursor-pointer">
              导入书签文件
            </label>
          </Button>
          <span className="text-sm text-muted-foreground">
            支持Chrome/Firefox导出的书签HTML文件
          </span>
        </div>
        <Button onClick={ () => saveBookmarks(bookmarks) }>同步</Button>
        <Button onClick={ () => navigate({ to: "/" }) }>返回</Button>
      </div>
      <div className="w-full ">
        { bookmarks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            { bookmarks.map((bookmark, index) => (
              <div
                key={ index }
                className="bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow p-4"
              >
                <div className="flex items-start gap-3">
                  { bookmark.icon && (
                    <img
                      src={ bookmark.icon }
                      alt="favicon"
                      className="w-6 h-6 mt-1 rounded"
                    />
                  ) }
                  <div className="flex-1">
                    <h3 className="font-medium line-clamp-2">
                      { bookmark.text }
                    </h3>
                    <a
                      href={ bookmark.href }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary line-clamp-1"
                      title={ bookmark.href }
                    >
                      { new URL(bookmark.href).hostname }
                    </a>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t flex justify-between text-sm">
                  <div className="text-muted-foreground">
                    <span className="mr-2">层级{ bookmark.level + 1 }</span>
                    <span>·</span>
                    <time
                      className="ml-2"
                      title={ new Date(
                        parseInt(bookmark.add_date) * 1000
                      ).toLocaleString() }
                    >
                      { new Date(
                        parseInt(bookmark.add_date) * 1000
                      ).toLocaleDateString() }
                    </time>
                  </div>
                </div>
              </div>
            )) }
          </div>
        ) }
      </div>
    </div>
  )
}
