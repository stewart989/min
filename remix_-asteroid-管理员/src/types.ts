/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ActiveTab = 
  | 'overview' 
  | 'settings' 
  | 'cloud' 
  | 'debug' 
  | 'plugins' 
  | 'integrations' 
  | 'api-keys' 
  | 'members' 
  | 'usage' 
  | 'billing' 
  | 'checkout'
  | 'support';

export interface GuideStep {
  id: string;
  title: string;
  description: string;
  connected: boolean;
  buttonText: string;
  actionType: 'connect_git' | 'connect_slack' | 'browse_plugins' | 'setup_proxy';
}

export interface PremiumPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  ctaText: string;
  popular?: boolean;
}

export interface ContributionCell {
  date: string;
  count: number;
}

export interface ActiveSession {
  id: string;
  device: string;
  subText: string;
  createdTime: string;
  isCurrent: boolean;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'version-control' | 'collaboration';
  connected: boolean;
  loading?: boolean;
  iconName: string;
}

export interface PluginItem {
  id: string;
  name: string;
  description: string;
  required: boolean;
  added: boolean;
  iconName: string;
}

export interface UsageMetric {
  date: string;
  tokens: number;
  requests: number;
  agentHours: number;
}

export interface BillingItem {
  type: string;
  currency: string;
  costPerUnit: string;
  quantity: number;
  total: string;
}

export interface Project {
  id: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
}
