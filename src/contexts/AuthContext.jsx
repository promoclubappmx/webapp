import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [employeePermissions, setEmployeePermissions] = useState(null) // null = not loaded, {} = no perms
  const [permissionsLoading, setPermissionsLoading] = useState(false)

  // Load employee permissions if account_type === 'employee'
  const loadEmployeePermissions = async (userId) => {
    if (!userId) return
    setPermissionsLoading(true)
    try {
      const { data, error } = await supabase?.rpc('get_employee_permissions', { p_user_id: userId })
      if (!error && data) {
        // Convert array to map: { module_name: { can_view, can_create, can_edit, can_delete } }
        const permsMap = {}
        data?.forEach(perm => {
          permsMap[perm?.module_name] = {
            canView: perm?.can_view,
            canCreate: perm?.can_create,
            canEdit: perm?.can_edit,
            canDelete: perm?.can_delete,
          }
        })
        setEmployeePermissions(permsMap)
      } else {
        setEmployeePermissions({})
      }
    } catch (error) {
      console.error('Permissions load error:', error)
      setEmployeePermissions({})
    } finally {
      setPermissionsLoading(false)
    }
  }

  // Isolated async operations - never called from auth callbacks
  const profileOperations = {
    async load(userId) {
      if (!userId) return
      setProfileLoading(true)
      try {
        const { data, error } = await supabase?.from('user_profiles')?.select('*')?.eq('id', userId)?.single()
        if (!error) {
          setUserProfile(data)
          // If employee account, load their permissions
          if (data?.account_type === 'employee') {
            loadEmployeePermissions(userId)
          } else {
            setEmployeePermissions(null) // Owner - no restrictions
          }
        }
      } catch (error) {
        console.error('Profile load error:', error)
      } finally {
        setProfileLoading(false)
      }
    },

    clear() {
      setUserProfile(null)
      setProfileLoading(false)
      setEmployeePermissions(null)
      setPermissionsLoading(false)
    }
  }

  // Auth state handlers - PROTECTED from async modification
  const authStateHandlers = {
    // This handler MUST remain synchronous - Supabase requirement
    onChange: (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
      
      if (session?.user) {
        profileOperations?.load(session?.user?.id) // Fire-and-forget
      } else {
        profileOperations?.clear()
      }
    }
  }

  useEffect(() => {
    // Initial session check
    supabase?.auth?.getSession()?.then(({ data: { session } }) => {
      authStateHandlers?.onChange(null, session)
    })

    // CRITICAL: This must remain synchronous
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(
      authStateHandlers?.onChange
    )

    return () => subscription?.unsubscribe()
  }, [])

  // Auth methods
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase?.auth?.signInWithPassword({ email, password })
      return { data, error }
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase?.auth?.signOut()
      if (!error) {
        setUser(null)
        profileOperations?.clear()
      }
      return { error }
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const updateProfile = async (updates) => {
    if (!user) return { error: { message: 'No user logged in' } }
    
    try {
      const { data, error } = await supabase?.from('user_profiles')?.update(updates)?.eq('id', user?.id)?.select()?.single()
      if (!error) setUserProfile(data)
      return { data, error }
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  // Helper: check if current user has permission for a module/action
  const hasPermission = (moduleName, action = 'canView') => {
    // Owners have all permissions
    if (!userProfile || userProfile?.account_type !== 'employee') return true
    // If permissions not loaded yet, deny by default
    if (employeePermissions === null) return false
    const modPerms = employeePermissions?.[moduleName]
    if (!modPerms) return false
    return modPerms?.[action] === true
  }

  // Computed values
  const isEmployee = userProfile?.account_type === 'employee'
  const isOwner = !userProfile || userProfile?.account_type === 'owner'

  const value = {
    user,
    userProfile,
    loading,
    profileLoading,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
    // Employee permission system
    employeePermissions,
    permissionsLoading,
    hasPermission,
    isEmployee,
    isOwner,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
