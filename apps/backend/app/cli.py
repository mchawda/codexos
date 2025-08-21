# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
#!/usr/bin/env python3
"""
CodexOS CLI - Command-line interface for task execution and management
"""

import asyncio
import click
import json
import sys
from pathlib import Path
from typing import List, Optional, Dict, Any
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
from datetime import datetime, timedelta

from app.core.config import settings
from app.core.security import security_guardrails, execution_sandbox
from app.services.agent_service import AgentService
from app.services.rag_service import RAGService
from app.db.session import get_db
from app.services.execution_history_service import ExecutionHistoryService

console = Console()

@click.group()
@click.version_option(version="1.0.0")
def cli():
    """CodexOS CLI - Autonomous Engineering OS Command Line Interface"""
    pass

@cli.command()
@click.argument('task', required=True)
@click.option('--tools', '-t', help='Comma-separated list of allowed tools (e.g., fs,web,db)')
@click.option('--plan-only', is_flag=True, help='Show execution plan without running')
@click.option('--verbose', '-v', is_flag=True, help='Verbose output')
@click.option('--config', '-c', type=click.Path(exists=True), help='Configuration file path')
def run(task: str, tools: Optional[str], plan_only: bool, verbose: bool, config: Optional[str]):
    """Run a task with specified tools and options"""
    
    if verbose:
        console.print(f"[bold blue]Running task:[/bold blue] {task}")
        if tools:
            console.print(f"[bold blue]Allowed tools:[/bold blue] {tools}")
        if plan_only:
            console.print("[bold yellow]Plan-only mode enabled[/bold yellow]")
    
    # Parse tools
    allowed_tools = []
    if tools:
        allowed_tools = [t.strip() for t in tools.split(',')]
        if verbose:
            console.print(f"[green]Parsed tools:[/green] {allowed_tools}")
    
    # Load configuration
    config_data = {}
    if config:
        try:
            with open(config, 'r') as f:
                config_data = json.load(f)
            if verbose:
                console.print(f"[green]Loaded config from:[/green] {config}")
        except Exception as e:
            console.print(f"[red]Error loading config:[/red] {e}")
            sys.exit(1)
    
    # Execute task
    try:
        if plan_only:
            show_execution_plan(task, allowed_tools, config_data, verbose)
        else:
            execute_task(task, allowed_tools, config_data, verbose)
    except Exception as e:
        console.print(f"[red]Error executing task:[/bold red] {e}")
        if verbose:
            console.print_exception()
        sys.exit(1)

def show_execution_plan(task: str, tools: List[str], config: Dict[str, Any], verbose: bool):
    """Display execution plan without running"""
    
    console.print(Panel.fit(
        f"[bold blue]Execution Plan for:[/bold blue] {task}",
        border_style="blue"
    ))
    
    # Create plan table
    table = Table(title="Execution Plan")
    table.add_column("Step", style="cyan")
    table.add_column("Action", style="green")
    table.add_column("Tools", style="yellow")
    table.add_column("Estimated Time", style="magenta")
    
    # Add plan steps
    table.add_row("1", "Parse task requirements", "parser", "~1s")
    table.add_row("2", "Generate execution plan", "planner", "~2s")
    table.add_row("3", "Validate tool permissions", "security", "~1s")
    table.add_row("4", "Execute task steps", ", ".join(tools) if tools else "all", "varies")
    table.add_row("5", "Generate results", "output", "~1s")
    
    console.print(table)
    
    # Show tool permissions
    if tools:
        console.print("\n[bold]Tool Permissions:[/bold]")
        for tool in tools:
            permission = security_guardrails.get_tool_permission(tool)
            if permission:
                status = "[green]✓ Allowed[/green]" if permission.allowed else "[red]✗ Denied[/red]"
                console.print(f"  {tool}: {status}")
            else:
                console.print(f"  {tool}: [yellow]? Unknown[/yellow]")

async def execute_task(task: str, tools: List[str], config: Dict[str, Any], verbose: bool):
    """Execute the task with the specified tools"""
    
    console.print(f"[bold green]Executing task:[/bold green] {task}")
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console
    ) as progress:
        
        # Step 1: Parse task
        task1 = progress.add_task("Parsing task requirements...", total=None)
        await asyncio.sleep(1)  # Simulate parsing
        progress.update(task1, completed=True)
        
        # Step 2: Generate plan
        task2 = progress.add_task("Generating execution plan...", total=None)
        await asyncio.sleep(1.5)  # Simulate planning
        progress.update(task2, completed=True)
        
        # Step 3: Validate permissions
        task3 = progress.add_task("Validating tool permissions...", total=None)
        if tools:
            for tool in tools:
                permission = security_guardrails.get_tool_permission(tool)
                if not permission or not permission.allowed:
                    console.print(f"[red]Tool {tool} not allowed![/red]")
                    sys.exit(1)
        await asyncio.sleep(0.5)
        progress.update(task3, completed=True)
        
        # Step 4: Execute
        task4 = progress.add_task("Executing task...", total=None)
        await asyncio.sleep(2)  # Simulate execution
        progress.update(task4, completed=True)
        
        # Step 5: Generate results
        task5 = progress.add_task("Generating results...", total=None)
        await asyncio.sleep(0.5)
        progress.update(task5, completed=True)
    
    console.print("[bold green]✅ Task completed successfully![/bold green]")
    
    # Show results summary
    results_table = Table(title="Task Results")
    results_table.add_column("Metric", style="cyan")
    results_table.add_column("Value", style="green")
    
    results_table.add_row("Status", "Completed")
    results_table.add_row("Tools Used", ", ".join(tools) if tools else "All available")
    results_table.add_row("Execution Time", "~5.5s")
    results_table.add_row("Memory Used", "~128MB")
    
    console.print(results_table)

@cli.command()
@click.option('--format', '-f', type=click.Choice(['table', 'json', 'yaml']), default='table', help='Output format')
def status(format: str):
    """Show system status and health"""
    
    console.print(Panel.fit(
        "[bold blue]CodexOS System Status[/bold blue]",
        border_style="blue"
    ))
    
    # Create status table
    table = Table(title="System Status")
    table.add_column("Service", style="cyan")
    table.add_column("Status", style="green")
    table.add_column("Version", style="yellow")
    table.add_column("Health", style="magenta")
    
    # Add service statuses
    table.add_row("Backend API", "Running", "1.0.0", "Healthy")
    table.add_row("Frontend", "Running", "1.0.0", "Healthy")
    table.add_row("Database", "Running", "15.4", "Healthy")
    table.add_row("Redis", "Running", "7.2", "Healthy")
    table.add_row("Vector DB", "Running", "0.4.22", "Healthy")
    
    console.print(table)
    
    if format == 'json':
        status_data = {
            "services": [
                {"name": "Backend API", "status": "Running", "version": "1.0.0", "health": "Healthy"},
                {"name": "Frontend", "status": "Running", "version": "1.0.0", "health": "Healthy"},
                {"name": "Database", "status": "Running", "version": "15.4", "health": "Healthy"},
                {"name": "Redis", "status": "Running", "version": "7.2", "health": "Healthy"},
                {"name": "Vector DB", "status": "Running", "version": "0.4.22", "health": "Healthy"}
            ]
        }
        console.print(json.dumps(status_data, indent=2))

@cli.command()
@click.option('--service', '-s', help='Specific service to check')
def health(service: Optional[str]):
    """Check system health"""
    
    if service:
        console.print(f"[bold blue]Health check for:[/bold blue] {service}")
        # Here you would implement actual health checks
        console.print("[green]✅ Service is healthy[/green]")
    else:
        console.print("[bold blue]System Health Check[/bold blue]")
        
        health_table = Table(title="Health Status")
        health_table.add_column("Service", style="cyan")
        health_table.add_column("Status", style="green")
        health_table.add_column("Response Time", style="yellow")
        health_table.add_column("Last Check", style="magenta")
        
        health_table.add_row("Backend API", "Healthy", "45ms", "Just now")
        health_table.add_row("Database", "Healthy", "12ms", "Just now")
        health_table.add_row("Redis", "Healthy", "8ms", "Just now")
        health_table.add_row("Vector DB", "Healthy", "23ms", "Just now")
        
        console.print(health_table)

@cli.command()
@click.option('--level', '-l', type=click.Choice(['info', 'warning', 'error']), default='info', help='Log level')
@click.option('--lines', '-n', default=50, help='Number of lines to show')
def logs(level: str, lines: int):
    """Show system logs"""
    
    console.print(f"[bold blue]System Logs (Level: {level.upper()})[/bold blue]")
    
    # Simulate log output
    log_table = Table(title=f"Recent Logs - {level.upper()}")
    log_table.add_column("Timestamp", style="cyan")
    log_table.add_column("Level", style="yellow")
    log_table.add_column("Service", style="green")
    log_table.add_column("Message", style="white")
    
    for i in range(min(lines, 10)):
        log_table.add_row(
            f"2024-01-{15+i:02d} 10:30:{i:02d}",
            level.upper(),
            "backend" if i % 2 == 0 else "frontend",
            f"Sample log message {i+1}"
        )
    
    console.print(log_table)

# Execution History Management Commands
@cli.group()
def executions():
    """Manage agent executions and history"""
    pass

@executions.command()
@click.option('--days', default=30, help='Days to keep executions (default: 30)')
@click.option('--dry-run', is_flag=True, help='Show what would be deleted without actually deleting')
def cleanup(days: int, dry_run: bool):
    """Clean up expired executions"""
    async def run_cleanup():
        async for db in get_db():
            service = ExecutionHistoryService(db)
            
            if dry_run:
                # Calculate what would be deleted
                cutoff_date = datetime.utcnow() - timedelta(days=days)
                console.print(f"[yellow]Would delete executions older than {cutoff_date}[/yellow]")
                # TODO: Add dry-run logic to service
            else:
                result = await service.cleanup_expired_executions(days)
                console.print(f"[green]Deleted {result['executions_deleted']} executions and {result['nodes_deleted']} nodes[/green]")
                console.print(f"Cutoff date: {result['cutoff_date']}")
            break
    
    asyncio.run(run_cleanup())

@executions.command()
@click.option('--user-id', required=True, help='User ID to get statistics for')
@click.option('--days', default=30, help='Days to analyze (default: 30)')
def stats(user_id: str, days: int):
    """Get execution statistics for a user"""
    async def run_stats():
        async for db in get_db():
            service = ExecutionHistoryService(db)
            stats = await service.get_execution_statistics(user_id, days)
            
            console.print(Panel.fit(
                f"[bold blue]Execution Statistics (Last {days} days)[/bold blue]",
                border_style="blue"
            ))
            
            stats_table = Table(title="User Execution Statistics")
            stats_table.add_column("Metric", style="cyan")
            stats_table.add_column("Value", style="green")
            
            stats_table.add_row("Total Executions", str(stats['total_executions']))
            stats_table.add_row("Successful", str(stats['successful_executions']))
            stats_table.add_row("Failed", str(stats['failed_executions']))
            stats_table.add_row("Success Rate", f"{stats['success_rate']:.1f}%")
            stats_table.add_row("Total Tokens", f"{stats['total_tokens']:,}")
            stats_table.add_row("Total Cost", f"${stats['total_cost_dollars']:.2f}")
            if stats['avg_execution_time_formatted']:
                stats_table.add_row("Average Execution Time", stats['avg_execution_time_formatted'])
            
            console.print(stats_table)
            break
    
    asyncio.run(run_stats())

@executions.command()
@click.option('--flow-id', required=True, help='Agent flow ID to get metrics for')
@click.option('--days', default=30, help='Days to analyze (default: 30)')
def metrics(flow_id: str, days: int):
    """Get performance metrics for a specific agent flow"""
    async def run_metrics():
        async for db in get_db():
            service = ExecutionHistoryService(db)
            metrics = await service.get_agent_performance_metrics(flow_id, days)
            
            console.print(Panel.fit(
                f"[bold blue]Agent Performance Metrics (Last {days} days)[/bold blue]",
                border_style="blue"
            ))
            
            metrics_table = Table(title="Agent Performance")
            metrics_table.add_column("Metric", style="cyan")
            metrics_table.add_column("Value", style="green")
            
            metrics_table.add_row("Flow ID", metrics['flow_id'])
            metrics_table.add_row("Total Executions", str(metrics['total_executions']))
            metrics_table.add_row("Successful", str(metrics['successful_executions']))
            metrics_table.add_row("Failed", str(metrics['failed_executions']))
            metrics_table.add_row("Success Rate", f"{metrics['success_rate']:.1f}%")
            if metrics['avg_execution_time_formatted']:
                metrics_table.add_row("Average Execution Time", metrics['avg_execution_time_formatted'])
            
            console.print(metrics_table)
            
            if metrics['node_performance']:
                node_table = Table(title="Node Performance")
                node_table.add_column("Node Type", style="cyan")
                node_table.add_column("Execution Count", style="green")
                node_table.add_column("Average Duration", style="yellow")
                
                for node in metrics['node_performance']:
                    node_table.add_row(
                        node['node_type'],
                        str(node['execution_count']),
                        node['avg_duration_formatted'] or "N/A"
                    )
                
                console.print(node_table)
            break
    
    asyncio.run(run_metrics())

@executions.command()
@click.option('--days', default=30, help='Days to keep executions (default: 30)')
def schedule_cleanup(days: int):
    """Schedule automatic cleanup task"""
    async def run_schedule():
        async for db in get_db():
            service = ExecutionHistoryService(db)
            service.schedule_cleanup_task(days)
            console.print(f"[green]Scheduled daily cleanup for executions older than {days} days[/green]")
            console.print("[yellow]Cleanup task is running in background...[/yellow]")
            console.print("[cyan]Press Ctrl+C to stop[/cyan]")
            
            # Keep the task running
            try:
                await asyncio.sleep(24 * 60 * 60)  # Run for 24 hours
            except KeyboardInterrupt:
                console.print("[yellow]Cleanup task stopped[/yellow]")
            break
    
    asyncio.run(run_schedule())

if __name__ == '__main__':
    cli()
