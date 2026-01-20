"use client"

export function useCrisp() {
  /**
   * Open the Crisp chat window
   */
  const openChat = () => {
    if (typeof window !== "undefined" && window.$crisp) {
      window.$crisp.push(["do", "chat:open"])
    }
  }

  /**
   * Close the Crisp chat window
   */
  const closeChat = () => {
    if (typeof window !== "undefined" && window.$crisp) {
      window.$crisp.push(["do", "chat:close"])
    }
  }

  /**
   * Set user information in Crisp
   */
  const setUserInfo = (email: string, name?: string) => {
    if (typeof window !== "undefined" && window.$crisp) {
      window.$crisp.push(["set", "user:email", email])
      if (name) {
        window.$crisp.push(["set", "user:nickname", name])
      }
    }
  }

  return {
    openChat,
    closeChat,
    setUserInfo,
  }
}
