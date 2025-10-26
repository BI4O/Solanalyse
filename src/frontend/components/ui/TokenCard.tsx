import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
} from 'recharts';
import type { TokenData } from '../../types/token';
import {
  TwitterIcon,
  TelegramIcon,
  DiscordIcon,
  WebsiteIcon,
  CheckCircleIcon,
  XCircleIcon,
  InfoIcon,
  ClipboardIcon,
  RefreshIcon,
} from './Icons';

const HolderTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-gray-800 border border-purple-500 rounded-md shadow-lg">
        <p className="text-sm text-purple-300">{`${payload[0].name}`}</p>
        <p className="text-sm text-white">{`Value: ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

const PriceTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const formattedDate = new Date(label).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return (
      <div className="p-2 bg-gray-800 border border-purple-500 rounded-md shadow-lg">
        <p className="text-xs text-gray-400">{formattedDate}</p>
        <p className="text-sm font-bold text-white">{`$${payload[0].value.toPrecision(4)}`}</p>
      </div>
    );
  }
  return null;
};

const InfoTooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  return (
    <div className="relative flex items-center group">
      {children}
      <div className="absolute bottom-full mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-800 border border-purple-500 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
        {text}
      </div>
    </div>
  );
};

interface TokenCardProps {
  data: TokenData;
  compact?: boolean;
}

export const TokenCard: React.FC<TokenCardProps> = ({ data, compact = false }) => {
  const [copied, setCopied] = useState(false);

  const holderDistributionData = useMemo(() => [
    { name: 'Top 10 Holders', value: data.holders.distribution_percentage.top_10 },
    { name: '11-20 Holders', value: data.holders.distribution_percentage['11_20'] },
    { name: '21-40 Holders', value: data.holders.distribution_percentage['21_40'] },
    { name: 'Rest of Holders', value: data.holders.distribution_percentage.rest },
  ], [data.holders.distribution_percentage]);

  const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];

  const copyAddress = () => {
    navigator.clipboard.writeText(data.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (compact) {
    // Compact version for chat
    return (
      <div className="w-full max-w-md bg-[#100c1c] text-gray-200 rounded-xl shadow-lg shadow-purple-900/40 border border-purple-700/50 overflow-hidden">
        <div className="p-3 bg-gradient-to-br from-purple-900/50 to-black/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={data.image_url} alt={data.name} className="w-10 h-10 rounded-full border border-purple-500"/>
              <div>
                <h3 className="text-lg font-bold text-white">{data.name}</h3>
                <p className="text-purple-300 text-sm font-mono">${data.symbol}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-purple-300">{data.gt_score}</span>
              <div className="text-xs text-gray-400">GT</div>
            </div>
          </div>
        </div>

        <div className="p-3 space-y-2">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-lg font-bold text-purple-300">{data.holders.count.toLocaleString()}</div>
              <div className="text-gray-400">Holders</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${data.security.mint_authority ? 'text-yellow-400' : 'text-green-400'}`}>
                {data.security.mint_authority ? '⚠️' : '✅'}
              </div>
              <div className="text-gray-400">Mint</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${data.security.freeze_authority ? 'text-yellow-400' : 'text-green-400'}`}>
                {data.security.freeze_authority ? '⚠️' : '✅'}
              </div>
              <div className="text-gray-400">Freeze</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-gray-400 truncate flex-1">{data.address}</span>
            <button
              onClick={copyAddress}
              className="ml-2 text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-purple-500/20"
            >
              {copied ? <CheckCircleIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Full version (similar to original)
  return (
    <div className="w-full max-w-sm bg-[#100c1c] text-gray-200 rounded-2xl shadow-2xl shadow-purple-900/40 border border-purple-700/50 overflow-hidden flex flex-col h-[500px]">
      <div className="p-4 bg-gradient-to-br from-purple-900/50 to-black/30 backdrop-blur-sm">
        <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
                <img src={data.image_url} alt={data.name} className="w-16 h-16 rounded-full border-2 border-purple-500"/>
                <div>
                  <h1 className="text-2xl font-bold text-white">{data.name}</h1>
                  <p className="text-purple-300 font-mono">${data.symbol}</p>
                </div>
            </div>
             <div className="flex items-center justify-start space-x-4">
              {data.social_media.twitter_handle && (
                <a href={`https://twitter.com/${data.social_media.twitter_handle}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <TwitterIcon className="w-5 h-5" />
                </a>
              )}
              {data.social_media.telegram_handle && (
                <a href={`https://t.me/${data.social_media.telegram_handle}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <TelegramIcon className="w-5 h-5" />
                </a>
              )}
              {data.social_media.discord_url && (
                <a href={data.social_media.discord_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <DiscordIcon className="w-5 h-5" />
                </a>
              )}
              {data.websites[0] && (
                <a href={data.websites[0]} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <WebsiteIcon className="w-5 h-5" />
                </a>
              )}
            </div>
        </div>

        <div className="mt-3">
            <p className="text-xs text-purple-300 mb-1 font-mono">Daily Price (7D)</p>
            <div className="w-full h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.price_history} margin={{ top: 5, right: 10, left: -25, bottom: -10 }}>
                     <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="date"
                        tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        tick={{ fill: '#a1a1aa', fontSize: 10 }}
                        stroke="#3f3f46"
                        axisLine={false}
                        tickLine={false}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        orientation="right"
                        tickFormatter={(num) => `$${num.toExponential(1)}`}
                        tick={{ fill: '#a1a1aa', fontSize: 10 }}
                        stroke="#3f3f46"
                        axisLine={false}
                        tickLine={false}
                        domain={['dataMin', 'dataMax']}
                    />
                    <RechartsTooltip content={<PriceTooltip />} cursor={{ stroke: 'rgba(167, 139, 250, 0.5)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                    <Area type="monotone" dataKey="price" stroke="#a78bfa" strokeWidth={2} fillOpacity={1} fill="url(#priceGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      <div className="flex-grow p-4 space-y-2">

        <div className="grid grid-cols-2 gap-4">
            {/* GT Score */}
            <div className="bg-gray-900/50 p-3 rounded-lg flex flex-col items-center justify-center text-center">
                 <div className="relative">
                    <svg className="w-16 h-16 transform -rotate-90">
                        <circle className="text-gray-700" strokeWidth="5" stroke="currentColor" fill="transparent" r="28" cx="32" cy="32" />
                        <circle
                            className="text-purple-500"
                            strokeWidth="5"
                            strokeDasharray={2 * Math.PI * 28}
                            strokeDashoffset={(2 * Math.PI * 28) * (1 - data.gt_score / 100)}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="28"
                            cx="32"
                            cy="32"
                        />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">{data.gt_score}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">GeckoTerminal Score</p>
            </div>

            {/* Holders Info */}
            <div className="bg-gray-900/50 p-3 rounded-lg flex flex-col items-center justify-center">
                <div className="w-full h-16">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={holderDistributionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={20}
                            outerRadius={28}
                            fill="#8884d8"
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                          >
                            {holderDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                           <RechartsTooltip content={<HolderTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                </div>
                <p className="text-lg font-bold">{data.holders.count.toLocaleString()}</p>
                <p className="text-xs text-gray-400">Total Holders</p>
            </div>
        </div>

        {/* Security Section */}
        <div className="bg-gray-900/50 p-3 rounded-lg">
          <h3 className="text-sm font-semibold text-purple-300 mb-2">Security Status</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span>Mint Authority</span>
                <InfoTooltip text="Ability to create new tokens. Disabled is safer for investors.">
                  <InfoIcon className="w-3 h-3 ml-1 text-gray-500" />
                </InfoTooltip>
              </div>
              {data.security.mint_authority ? (
                <div className="flex items-center text-yellow-400"><XCircleIcon className="w-4 h-4 mr-1" />Enabled</div>
              ) : (
                <div className="flex items-center text-green-400"><CheckCircleIcon className="w-4 h-4 mr-1" />Disabled</div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span>Freeze Authority</span>
                <InfoTooltip text="Ability to freeze token transfers for holders. Disabled is safer.">
                  <InfoIcon className="w-3 h-3 ml-1 text-gray-500" />
                </InfoTooltip>
              </div>
              {data.security.freeze_authority ? (
                <div className="flex items-center text-yellow-400"><XCircleIcon className="w-4 h-4 mr-1" />Enabled</div>
              ) : (
                <div className="flex items-center text-green-400"><CheckCircleIcon className="w-4 h-4 mr-1" />Disabled</div>
              )}
            </div>
             <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <span>Honeypot</span>
                    <InfoTooltip text="A honeypot is a smart contract that appears to have a design flaw, but is actually a trap.">
                        <InfoIcon className="w-3 h-3 ml-1 text-gray-500" />
                    </InfoTooltip>
                </div>
                {data.security.is_honeypot ? (
                    <div className="flex items-center text-red-500"><XCircleIcon className="w-4 h-4 mr-1" />Yes</div>
                ) : (
                    <div className="flex items-center text-green-400"><CheckCircleIcon className="w-4 h-4 mr-1" />No</div>
                )}
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
            {data.categories.slice(0, 3).map(cat => (
                <span key={cat} className="text-xs bg-purple-900/70 text-purple-200 px-2 py-1 rounded-full">{cat}</span>
            ))}
        </div>

      </div>

      <div className="p-3 bg-black/30 border-t border-purple-700/30">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span className="truncate pr-2">{data.address}</span>
            <button onClick={copyAddress} className="flex-shrink-0 text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-purple-500/20">
              {copied ? <CheckCircleIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>
    </div>
  );
};