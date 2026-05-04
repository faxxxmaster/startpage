const config = {
  aiTools: [
    { name: '🤖', url: 'https://claude.ai/new', title: 'Claude' },
    { name: '✨', url: 'https://gemini.google.com/app', title: 'Gemini' },
    { name: '💬', url: 'https://chatgpt.com', title: 'ChatGPT' },
    { name: '🔍', url: 'https://chat.deepseek.com', title: 'DeepSeek' },
    { name: '🚀', url: 'https://grok.x.com', title: 'Grok' },
    { name: '🦆', url: 'https://www.duck.ai', title: 'Duck.ai' },
    { name: '💭', url: 'https://chat.mistral.ai', title: 'Mistral' },
    { name: '🌙', url: 'https://kimi.com', title: 'Kimi' },
    { name: '🎬', url: 'https://agent.minimax.io/', title: 'MiniMax' },
    { name: '🐋', url: 'https://chat.qwen.ai', title: 'Qwen' },
    { name: '⚡', url: 'https://chat.z.ai/', title: 'Z.ai' },
    { name: '🧠', url: 'https://www.perplexity.ai', title: 'Perplexity' }
  ],
  categories: [
    {
      name: 'homelab', title: 'homelab', links: [
        { name: 'immich', url: 'https://bilder.faxxxmaster.cc' },
        { name: 'wiki', url: 'https://wiki.faxxxmaster.cc' },
        { name: 'DumbPad', url: 'https://pad.faxxxmaster.cc' },
        { name: 'DumbDrop', url: 'https://drop.faxxxmaster.cc/' },
        { name: 'bentopdf', url: 'https://bento.homelab.faxxxmaster.cc/' },
        { name: 'papra', url: 'https://papra.homelab.faxxxmaster.cc/' },
        { name: 'Audiobook', url: 'https://audiobook.faxxxmaster.cc/' },
        { name: 'LinkWarden', url: 'http://192.168.122.202:3333' },
        { name: 'vaultwarden', url: 'https://vaultwarden.liste.cc/' }
      ]
    },

    {
      name: 'priv', title: 'priv', links: [
        { name: 'gmail', url: 'https://mail.google.com/' },
        { name: 'calendar', url: 'https://calendar.google.com/calendar/u/0' },
        { name: 'infomaniak', url: 'https://ksuite.infomaniak.com/' },
        { name: 'box', url: 'https://box.com/' }
      ]
    },

    {
      name: 'tools', title: 'tools', links: [

        { name: 'SwissTransfer', url: 'https://www.swisstransfer.com/' },
        { name: 'pastebin', url: 'https://paaster.io/' },
        { name: 'ItTools', url: 'https://it-tools.tech/' },
        { name: 'OmniTools', url: 'https://omnitools.app/' },
        { name: 'DeepL', url: 'https://www.deepl.com/de/translator/l/en/de' },
        { name: 'freeTranslate', url: 'https://translate.liste.cc/' },
        { name: 'termbin', url: 'https://termbin.com/' },
        { name: 'speedtest', url: 'https://speed.cloudflare.com/' },
        { name: 'LibreTranslate', url: 'https://libretranslate.com/' }
      ]
    },

    {
      name: 'dev', title: 'dev', links: [
        { name: 'GitHub', url: 'https://github.com/faxxxmaster/' },
        { name: 'terminaltrove', url: 'https://terminaltrove.com/' },
        { name: 'self-hosted', url: 'https://selfh.st/' },
        { name: 'awesome', url: 'https://www.trackawesomelist.com/awesome-selfhosted/awesome-selfhosted/' },
        { name: 'noted', url: 'https://noted.lol/' },
        { name: 'selfhosted', url: 'https://awesome-selfhosted.net/' },
        { name: 'ArchWiki', url: 'https://wiki.archlinux.org/title/Main_page' },
        { name: 'CachyWiki', url: 'https://wiki.cachyos.org/cachyos_basic/download/' },
        { name: 'CachyForum', url: 'https://discuss.cachyos.org/' },
        { name: 'CachyRep', url: 'https://dashboard.cachyos.org/' },
        { name: 'CachyMirror', url: 'https://mirror.cachyos.org/' },
        { name: 'newreleases', url: 'https://newreleases.io/' }
      ]
    },

    {
      name: 'pics', title: 'pics', links: [
        { name: 'ultrawide', url: 'https://ultrawidewallpapers.net/' },
        { name: 'wallhaven', url: 'https://wallhaven.cc/' },
        { name: 'moewalls', url: 'https://moewalls.com/' },
        { name: 'deviantart', url: 'https://www.deviantart.com/' },
        { name: 'uhdpaper', url: 'https://www.uhdpaper.com' },
        { name: 'pxfuel', url: 'https://www.pxfuel.com/' },
        { name: 'wallpaperscraft', url: 'https://wallpaperscraft.com/' },
        { name: 'mazanoke', url: 'https://mazanoke.com/' },
        { name: 'photopea', url: 'https://www.photopea.com/' },
        { name: 'post images', url: 'https://postimages.org/' },
        { name: 'tenor', url: 'https://tenor.com/de/' },
        { name: 'giphy', url: 'https://giphy.com/' }
      ]
    },

    {
      name: 'play', title: 'play', links: [
        { name: 'monkeytype', url: 'https://monkeytype.com/' },
        { name: 'steam', url: 'https://store.steampowered.com/?l=german/' },
        { name: 'serienfans', url: 'https://serienfans.org/' },
        { name: 'filmfans', url: 'https://filmfans.org' },
        { name: 'boerse', url: 'https://boerse.cx' }
      ]
    },

    {
      name: 'social', title: 'social', links: [
        { name: 'youtube', url: 'https://youtube.com/' },
        { name: 'x', url: 'https://x.com/' },
        { name: 'reddit', url: 'https://reddit.com/' },
        { name: 'twitch', url: 'https://www.twitch.tv/' },
        { name: 'discord', url: 'https://discord.com/channels/862292009423470592/1150723027986813018/' },
        { name: '4chan', url: 'https://4chan.org/' },
        { name: 'instagram', url: 'https://www.instagram.com/' }
      ]
    },

    {
      name: 'work', title: 'work', links: [
        { name: 'INWX', url: 'https://inwx.de/' },
        { name: 'DynaDot', url: 'https://www.dynadot.com/' },
        { name: 'SCP', url: 'https://www.servercontrolpanel.de/SCP/Home' },
        { name: 'NCCP', url: 'https://www.customercontrolpanel.de/' },
        { name: 'h-fuchs.de', url: 'https://hosting-fuchs.de/' },
        { name: 'TryHackMe', url: 'https://tryhackme.com/' },
        { name: 'HackTheBox', url: 'https://hackthebox.com/' },
        { name: 'OverTheWire', url: 'https://overthewire.org/wargames/' },
        { name: 'academy', url: 'https://bootstrap.academy/' }
      ]
    },

    {
      name: 'hack', title: 'hack', links: [
        { name: 'exploit-db', url: 'https://www.exploit-db.com/' },
        { name: 'hashes.com', url: 'https://hashes.com/en/decrypt/hash' },
        { name: 'dcode', url: 'https://www.dcode.fr/en' },
        { name: 'regex101', url: 'https://regex101.com/' },
        { name: 'explainshell', url: 'https://explainshell.com/' },
        { name: 'CyberChef', url: 'https://gchq.github.io/CyberChef/' },
        { name: 'it-tools', url: 'https://it-tools.tech/' },
        { name: 'hacktricks', url: 'https://book.hacktricks.wiki/de/index.html' },
        { name: 'gtfobins', url: 'https://gtfobins.org/' },
        { name: 'DeepWiki', url: 'https://deepwiki.com/' },
        { name: 'crackstation', url: 'https://crackstation.net/' },
        { name: 'reverseshell', url: 'https://www.revshells.com/' },
        { name: 'shodan', url: 'https://www.shodan.io/' }
      ]
    }
  ]
};
