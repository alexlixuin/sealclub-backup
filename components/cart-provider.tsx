"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { AffiliateInfo, DiscountInfo } from "../lib/types";

export type CartItem = {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  variant?: string
  sizeId?: string
  isSubscription?: boolean
  subscriptionInterval?: 'month' | 'year'
  subscriptionIntervalCount?: number
}

export type ShippingMethod = {
  id: string;
  name: string;
  price: number;
  description: string;
  eligibleCountries: string[];
  requiresEligibleProducts?: boolean;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, sizeId?: string) => void;
  updateQuantity: (id: string, quantity: number, sizeId?: string) => void;
  clearCart: () => void;
  subtotal: number;
  discount: DiscountInfo | null;
  setDiscount: (discount: DiscountInfo | null) => void;
  discountAmount: number;
  affiliate: AffiliateInfo | null;
  setAffiliate: (affiliate: AffiliateInfo | null) => void;
  total: number;
  shippingMethod: ShippingMethod | null;
  setShippingMethod: (method: ShippingMethod | null) => void;
  updateShippingMethodByCountry: (countryCode: string) => void;
  shippingCost: number;
  availableShippingMethods: ShippingMethod[];
  getAvailableShippingMethods: (countryCode: string) => ShippingMethod[];
  hasNextDayEligibleProducts: boolean;
  checkNextDayEligibility: (cartItems?: CartItem[]) => boolean;
  protocolGuideSelected: boolean;
  setProtocolGuideSelected: (selected: boolean) => void;
  protocolGuidePrice: number;
  nasalSpraySelected: boolean;
  setNasalSpraySelected: (selected: boolean) => void;
  nasalSprayPrice: number;
  oneTimeItems: CartItem[];
  subscriptionItems: CartItem[];
  hasSubscriptionItems: boolean;
  storeCredit: number;
  setStoreCredit: (credit: number) => void;
  storeCreditUsed: number;
  setStoreCreditUsed: (amount: number) => void;
  useStoreCredit: boolean;
  setUseStoreCredit: (use: boolean) => void;
  availableStoreCredit: number;
  setAvailableStoreCredit: (amount: number) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined)

// Products eligible for Next Day Delivery (Melbourne only)
const nextDayEligibleProducts = [
  'retatrutide', 'semaglutide', 'tirzepatide', 'cjc1295-ipamorelin',
  'bpc157', 'tb500', 'aod9604', 'melanotan2', 'pt141', 'oxytocin',
  'cagrilintide', 'hgh', 'igf1-lr3', 'mk677', 'tesamorelin',
  'semax', 'bacteriostatic-water', 'bacteriostatic-water-10ml'
];

// Available shipping methods
const availableShippingMethods: ShippingMethod[] = [
  {
    id: 'standard-au',
    name: 'Standard Shipping (Oceania ONLY)',
    price: 15.00,
    description: 'Standard delivery to Oceania countries',
    eligibleCountries: ['AU', 'NZ', 'FJ', 'PG', 'NC', 'SB', 'VU', 'WS', 'TO', 'TV', 'NR', 'KI', 'PW', 'MH', 'FM']
  },
  {
    id: 'next-day-au',
    name: 'Next Day Delivery (Melbourne ONLY)',
    price: 65.00,
    description: 'Next business day delivery for Melbourne residents',
    eligibleCountries: ['AU'],
    requiresEligibleProducts: true
  },
  {
    id: 'express-intl',
    name: 'Express International (Worldwide Dispatch)',
    price: 45.99,
    description: 'Express delivery worldwide',
    eligibleCountries: []
  }
];

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<DiscountInfo | null>(null);
  const [affiliateState, setAffiliateState] = useState<AffiliateInfo | null>(null);
  const [protocolGuideSelected, setProtocolGuideSelected] = useState(false);
  const [nasalSpraySelected, setNasalSpraySelected] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod | null>(null);
  const [storeCredit, setStoreCredit] = useState<number>(0);
  const [storeCreditUsed, setStoreCreditUsed] = useState<number>(0);
  const [useStoreCredit, setUseStoreCredit] = useState<boolean>(false);
  const [availableStoreCredit, setAvailableStoreCredit] = useState<number>(0);
  
  const protocolGuidePrice = 50;
  const nasalSprayPrice = 55;

  const setAffiliate = (affiliateInfo: AffiliateInfo | null) => {
    if (affiliateInfo) {
      const completeAffiliateInfo: AffiliateInfo = {
        ...affiliateInfo,
        discountPercentage: affiliateInfo.discountPercentage || 0,
      };
      setAffiliateState(completeAffiliateInfo);
    } else {
      setAffiliateState(null);
    }
  };

  // Function to check if cart has Next Day eligible products
  const hasNextDayEligibleProducts = useCallback((cartItems?: CartItem[]): boolean => {
    if (typeof window === 'undefined') {
      console.log('Server-side environment detected, skipping eligibility check');
      return false;
    }

    const itemsToCheck = cartItems || items;
    console.log('Checking eligibility for items:', itemsToCheck.map(item => item.id));
    const hasEligible = itemsToCheck.some(item => nextDayEligibleProducts.includes(item.id));
    console.log('Has eligible products:', hasEligible);
    return hasEligible;
  }, [items]);

  // Function to check eligibility (exposed for external use)
  const checkNextDayEligibility = useCallback((cartItems?: CartItem[]): boolean => {
    return hasNextDayEligibleProducts(cartItems);
  }, [hasNextDayEligibleProducts]);

  // Get available shipping methods for a country
  const getAvailableShippingMethods = useCallback((countryCode: string): ShippingMethod[] => {
    console.log('Getting available methods for country:', countryCode);
    const methods: ShippingMethod[] = [];
    
    for (const method of availableShippingMethods) {
      let isEligible = false;
      
      if (method.eligibleCountries.length === 0) {
        // International shipping - for countries not covered by regional methods
        const isRegionalCountry = availableShippingMethods
          .filter(m => m.eligibleCountries.length > 0)
          .some(m => m.eligibleCountries.includes(countryCode));
        isEligible = !isRegionalCountry;
      } else {
        // Regional shipping - check if country is eligible
        isEligible = method.eligibleCountries.includes(countryCode);
      }
      
      // Check if method requires eligible products
      if (isEligible && method.requiresEligibleProducts) {
        isEligible = hasNextDayEligibleProducts();
        console.log(`Method ${method.name} requires eligible products:`, isEligible);
      }
      
      if (isEligible) {
        methods.push(method);
      }
    }
    
    console.log('Available methods:', methods.map(m => m.name));
    return methods;
  }, [hasNextDayEligibleProducts]);
  // Update shipping method based on country
  const updateShippingMethodByCountry = useCallback((countryCode: string) => {
    console.log('updateShippingMethodByCountry called with:', countryCode);
    
    const availableMethods = getAvailableShippingMethods(countryCode);
    
    // Only update if no method selected or current method not available for this country
    if (!shippingMethod || !availableMethods.some(m => m.id === shippingMethod.id)) {
      console.log('Setting default shipping method for country:', countryCode);
      const preferredMethod = availableMethods.find(method => method.id === 'standard-au' && (method.price === 0 || items.reduce((total, item) => total + item.price * item.quantity, 0) >= 250));
      if (preferredMethod) {
        setShippingMethod(preferredMethod);
      } else if (availableMethods.length > 0) {
        setShippingMethod(availableMethods[0]); // Use first available method as default
      }
    } else {
      console.log('Keeping current shipping method:', shippingMethod.name);
    }
  }, [shippingMethod, getAvailableShippingMethods]);

  // Load cart from localStorage on mount
  useEffect(() => {
    console.log('=== CART PROVIDER INITIALIZATION ===');
    const savedCart = localStorage.getItem("cart")
    
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        if (Array.isArray(parsedCart)) {
          setItems(parsedCart)
          console.log('Cart items loaded:', parsedCart.length, 'items');
        }
      } catch (error) {
        console.error("Error parsing cart:", error)
      }
    }
    
    // Load shipping method selection
    const savedShippingMethod = localStorage.getItem("shippingMethod")
    if (savedShippingMethod) {
      try {
        const parsedMethod = JSON.parse(savedShippingMethod)
        setShippingMethod(parsedMethod)
        console.log('Shipping method loaded:', parsedMethod.name);
      } catch (error) {
        console.error("Error parsing shipping method:", error)
      }
    }
    
    // Load protocol guide selection
    const savedProtocolGuide = localStorage.getItem("protocolGuideSelected")
    if (savedProtocolGuide) {
      setProtocolGuideSelected(JSON.parse(savedProtocolGuide))
    }
    
    // Load nasal spray selection
    const savedNasalSpray = localStorage.getItem("nasalSpraySelected")
    if (savedNasalSpray) {
      setNasalSpraySelected(JSON.parse(savedNasalSpray))
    }
    
    // Load store credit
    const savedStoreCredit = localStorage.getItem("storeCredit")
    if (savedStoreCredit) {
      setStoreCredit(JSON.parse(savedStoreCredit))
    }
    
    // Load store credit used
    const savedStoreCreditUsed = localStorage.getItem("storeCreditUsed")
    if (savedStoreCreditUsed) {
      setStoreCreditUsed(JSON.parse(savedStoreCreditUsed))
    }
    
    // Load use store credit
    const savedUseStoreCredit = localStorage.getItem("useStoreCredit")
    if (savedUseStoreCredit) {
      setUseStoreCredit(JSON.parse(savedUseStoreCredit))
    }
    
    // Load available store credit
    const savedAvailableStoreCredit = localStorage.getItem("availableStoreCredit")
    if (savedAvailableStoreCredit) {
      setAvailableStoreCredit(JSON.parse(savedAvailableStoreCredit))
    }
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items))
  }, [items])
  
  // Save shipping method to localStorage whenever it changes
  useEffect(() => {
    if (shippingMethod) {
      localStorage.setItem("shippingMethod", JSON.stringify(shippingMethod))
      console.log('Shipping method saved to localStorage:', shippingMethod.name);
    } else {
      localStorage.removeItem("shippingMethod")
    }
  }, [shippingMethod])
  
  // Save protocol guide selection to localStorage
  useEffect(() => {
    localStorage.setItem("protocolGuideSelected", JSON.stringify(protocolGuideSelected))
  }, [protocolGuideSelected])
  
  // Save nasal spray selection to localStorage
  useEffect(() => {
    localStorage.setItem("nasalSpraySelected", JSON.stringify(nasalSpraySelected))
  }, [nasalSpraySelected])
  
  // Save store credit to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("storeCredit", JSON.stringify(storeCredit))
  }, [storeCredit])
  
  // Save store credit used to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("storeCreditUsed", JSON.stringify(storeCreditUsed))
  }, [storeCreditUsed])
  
  // Save use store credit to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("useStoreCredit", JSON.stringify(useStoreCredit))
  }, [useStoreCredit])
  
  // Save available store credit to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("availableStoreCredit", JSON.stringify(availableStoreCredit))
  }, [availableStoreCredit])

  const addItem = (newItem: CartItem) => {
    setItems((prevItems) => {
      // Check if the item with the same ID and size already exists
      const existingItemIndex = prevItems.findIndex((item) => item.id === newItem.id && item.sizeId === newItem.sizeId)

      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += newItem.quantity
        return updatedItems
      } else {
        // Add new item
        return [...prevItems, newItem]
      }
    })
  }

  const removeItem = (id: string, sizeId?: string) => {
    setItems((prevItems) => prevItems.filter((item) => !(item.id === id && item.sizeId === sizeId)))
  }

  const updateQuantity = (id: string, quantity: number, sizeId?: string) => {
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id && item.sizeId === sizeId ? { ...item, quantity } : item)),
    )
  }

  const clearCart = useCallback(() => {
    // Only update state if there are items to clear
    if (items.length > 0) {
      setItems([])
      setDiscount(null)
      setAffiliateState(null)
      setProtocolGuideSelected(false)
      setNasalSpraySelected(false)
      localStorage.setItem("cart", JSON.stringify([]))
      localStorage.removeItem("cartDiscount")
      localStorage.removeItem("cartAffiliate")
      localStorage.removeItem("cartProtocolGuideSelected")
      localStorage.removeItem("cartNasalSpraySelected")
    }
  }, [items.length])

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)

  // Calculate total with both discount and affiliate discount applied
  let totalAfterDiscounts = subtotal
  let calculatedDiscountAmount = 0

  // Apply regular discount first
  if (discount) {
    console.log('Calculating discount:', { discount, subtotal });
    if (discount.type === "percentage") {
      calculatedDiscountAmount = (subtotal * discount.value) / 100
    } else if (discount.type === "fixed") {
      calculatedDiscountAmount = Math.min(discount.value, subtotal)
    }
    console.log('Calculated discount amount:', calculatedDiscountAmount);
    totalAfterDiscounts = Math.max(0, totalAfterDiscounts - calculatedDiscountAmount)
  }

  // Apply affiliate discount (if any)
  if (affiliateState && affiliateState.amountSaved > 0) {
    totalAfterDiscounts = Math.max(0, totalAfterDiscounts - affiliateState.amountSaved)
  }

  // Apply store credit (if any)
  if (useStoreCredit && storeCreditUsed > 0) {
    totalAfterDiscounts = Math.max(0, totalAfterDiscounts - storeCreditUsed)
  }

  // Add protocol guide (no discounts apply)
  const totalBeforeShipping =
    totalAfterDiscounts +
    (protocolGuideSelected ? protocolGuidePrice : 0) +
    (nasalSpraySelected ? nasalSprayPrice : 0)
  const total = totalBeforeShipping;

  const shippingCost = !shippingMethod ? 0 :
    (shippingMethod.id === 'standard-au' && total >= 250) || // Free shipping for AU orders over $250
    (shippingMethod.id === 'express-intl' && total >= 500)   // Free shipping for international orders over $500
      ? 0
      : shippingMethod.price;

  // Separate one-time and subscription items
  const oneTimeItems = items.filter(item => !item.isSubscription);
  const subscriptionItems = items.filter(item => item.isSubscription);
  const hasSubscriptionItems = subscriptionItems.length > 0;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        discount,
        setDiscount,
        discountAmount: calculatedDiscountAmount,
        affiliate: affiliateState,
        setAffiliate,
        total,
        shippingMethod,
        setShippingMethod,
        updateShippingMethodByCountry,
        shippingCost,
        availableShippingMethods,
        getAvailableShippingMethods,
        hasNextDayEligibleProducts: hasNextDayEligibleProducts(items),
        checkNextDayEligibility: hasNextDayEligibleProducts,
        protocolGuideSelected,
        setProtocolGuideSelected,
        protocolGuidePrice,
        nasalSpraySelected,
        setNasalSpraySelected,
        nasalSprayPrice,
        oneTimeItems,
        subscriptionItems,
        hasSubscriptionItems,
        storeCredit,
        setStoreCredit,
        storeCreditUsed,
        setStoreCreditUsed,
        useStoreCredit,
        setUseStoreCredit,
        availableStoreCredit,
        setAvailableStoreCredit,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
