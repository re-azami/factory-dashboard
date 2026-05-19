import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';

import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './chat.component';
import { ChatMessageComponent } from './components/chat-message/chat-message.component';
import { ChatToolCardComponent } from './components/chat-tool-card/chat-tool-card.component';
import { ChatComposerComponent } from './components/chat-composer/chat-composer.component';

@NgModule({
    declarations: [ChatComponent, ChatMessageComponent, ChatToolCardComponent, ChatComposerComponent],
    imports: [SharedModule, ChatRoutingModule],
})
export class ChatModule {}
