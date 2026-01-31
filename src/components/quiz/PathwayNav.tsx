import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Brain, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const pathways = [
  {
    id: 'practice',
    path: '/',
    label: 'Practice',
    icon: BookOpen,
    title: 'Practice Mode',
    description: 'Pick topics & master each level step by step',
  },
  {
    id: 'adaptive',
    path: '/adaptive',
    label: 'Adaptive',
    icon: Brain,
    title: 'Adaptive Challenge',
    description: 'AI adjusts difficulty based on your performance',
  },
  {
    id: 'olympiad',
    path: '/olympiad',
    label: 'Olympiad',
    icon: Trophy,
    title: 'Olympiad Test',
    description: 'Timed exam prep with competition-style questions',
  },
];

export const PathwayNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  return (
    <div className="flex items-center gap-2">
      {pathways.map((pathway) => {
        const Icon = pathway.icon;
        const active = isActive(pathway.path);

        return (
          <Tooltip key={pathway.id}>
            <TooltipTrigger asChild>
              {active ? (
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 text-white border-2 border-white/40 hover:bg-white/30 cursor-default"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1">{pathway.label}</span>
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  asChild
                  className="bg-white/10 text-white/80 hover:bg-white/20 hover:text-white border-0"
                >
                  <Link to={pathway.path} className="flex items-center gap-1">
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{pathway.label}</span>
                  </Link>
                </Button>
              )}
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[200px] text-center">
              <p className="font-semibold">{pathway.title}</p>
              <p className="text-xs text-muted-foreground">{pathway.description}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
};
